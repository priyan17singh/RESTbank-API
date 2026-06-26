const transactionModel = require("../models/transaction.model");
const accountModel = require("../models/account.model");
const mongoose = require("mongoose");
const ledgerModel = require("../models/ledger.model");
const {
  sendTransactionEmail,
  sendTransactionFailureEmail,
} = require("../services/email.service");

async function createTransaction(req, res) {
  try {
    // Validate request

    const { fromAccount, toAccount, amount, idempotencyKey } = req.body;

    if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
      return res
        .status(400)
        .json({ message: "Missing required fields for transaction." });
    }

    const fromUserAccount = await accountModel.findById(fromAccount);
    const toUserAccount = await accountModel.findById(toAccount);

    if (!fromUserAccount || !toAccount) {
      return res.status(400).json({ message: "Invalid from or to account." });
    }

    // Validate idempotency key

    const existingTransaction = await transactionModel.findOne({
      idempotencyKey: idempotencyKey,
    });
    if (existingTransaction) {
      if (existingTransaction.status === "COMPLETED") {
        return res.status(200).json({
          message: "Transaction already processed.",
          transaction: existingTransaction,
        });
      }
      if (existingTransaction.status === "PENDING") {
        return res
          .status(200)
          .json({ message: "Transaction is still processing..." });
      }
      if (existingTransaction.status === "FAILED") {
        return res
          .status(500)
          .json({ message: "Transaction processing failed, please retry." });
      }
      if (existingTransaction.status === "REVERSED") {
        return res
          .status(500)
          .json({ message: "Transaction processing reversed, please retry." });
      }
    }

    // Check account status

    if (
      fromUserAccount.status !== "ACTIVE" ||
      toUserAccount.status !== "ACTIVE"
    ) {
      return res.status(400).json({ message: "Account is not active." });
    }

    // Derive senders balance through ledger

    const balance = await fromUserAccount.getBalance();
    if (balance < amount) {
      return res.status(400).json({
        message: `Insufficiant balance. Current balance is ${balance}.`,
      });
    }

    // Create transaction(PENDING)

    let transaction;
    try {
      /**
       * 5. Create transaction (PENDING)
       */
      const session = await mongoose.startSession();
      session.startTransaction();

      transaction = (
        await transactionModel.create(
          [
            {
              fromAccount,
              toAccount,
              amount,
              idempotencyKey,
              status: "PENDING",
            },
          ],
          { session },
        )
      )[0];

      const debitLedgerEntry = await ledgerModel.create(
        [
          {
            account: fromAccount,
            amount: amount,
            transaction: transaction._id,
            type: "DEBIT",
          },
        ],
        { session },
      );

      await (() => {
        return new Promise((resolve) => setTimeout(resolve, 15 * 1000));
      })();

      const creditLedgerEntry = await ledgerModel.create(
        [
          {
            account: toAccount,
            amount: amount,
            transaction: transaction._id,
            type: "CREDIT",
          },
        ],
        { session },
      );

      await transactionModel.findOneAndUpdate(
        { _id: transaction._id },
        { status: "COMPLETED" },
        { session },
      );

      await session.commitTransaction();
      session.endSession();
    } catch (error) {
      return res.status(400).json({
        message:
          "Transaction is Pending due to some issue, please retry after sometime",
      });
    }

    await sendTransactionEmail(
      req.user.email,
      req.user.name,
      amount,
      toAccount,
    );

    res.status(201).json({
      message: "Transaction is successfull.",
      transaction: transaction,
    });
  } catch (error) {
    await sendTransactionFailureEmail(
      req.user.email,
      req.user.name,
      amount,
      toAccount,
    );
    console.error(`Error occured while creation a transaction:${error}`);
  }
}

async function createInitialFundsTransaction(req, res) {
  const { toAccount, amount, idempotencyKey } = req.body;

  if (!toAccount || !amount || !idempotencyKey) {
    return res.status(400).json({
      message: "toAccount, amount and idempotencyKey are required",
    });
  }

  const toUserAccount = await accountModel.findById(toAccount);

  if (!toUserAccount) {
    return res.status(400).json({
      message: "Invalid toAccount",
    });
  }

  const fromUserAccount = await accountModel.findOne({
    userId: req.user._id,
  });
  console.log(fromUserAccount);
  console.log(req.user._id);
  if (!fromUserAccount) {
    return res.status(400).json({
      message: "System user account not found.",
    });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  const transaction = new transactionModel({
    fromAccount: fromUserAccount._id,
    toAccount,
    amount,
    idempotencyKey,
    status: "PENDING",
  });

  const debitLedgerEntry = await ledgerModel.create(
    [
      {
        account: fromUserAccount._id,
        amount: amount,
        transaction: transaction._id,
        type: "DEBIT",
      },
    ],
    { session },
  );

  const creditLedgerEntry = await ledgerModel.create(
    [
      {
        account: toAccount,
        amount: amount,
        transaction: transaction._id,
        type: "CREDIT",
      },
    ],
    { session },
  );

  transaction.status = "COMPLETED";
  await transaction.save({ session });

  await session.commitTransaction();
  session.endSession();

  return res.status(201).json({
    message: "Initial funds transaction completed successfully",
    transaction: transaction,
  });
}

module.exports = { createTransaction, createInitialFundsTransaction };
