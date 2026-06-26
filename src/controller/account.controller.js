const accountModel = require("../models/account.model");



async function createAccount(req, res) {
    try {
        const user = req.user;

        const account = await accountModel.create({
            userId: user._id,
            // currency: req.body.currency || INR
        });

        res.status(201).json({
            message: "Account created successfully.",
            account
        });
    } catch (error) {
        console.error(`Error occured while creation an account:${error}`);
    }
}

async function getUserAccountsController(req, res) {

    const accounts = await accountModel.find({ userId: req.user._id });

    res.status(200).json({
        accounts
    })
}

async function getAccountBalanceController(req, res) {
    const { accountId } = req.body;

    const account = await accountModel.findOne({
        _id: accountId,
        userId: req.user._id
    })
    
    if (!account) {
        return res.status(404).json({
            message: "Account not found"
        })
    }

    const balance = await account.getBalance();

    res.status(200).json({
        accountId: account._id,
        balance: balance
    })
}


module.exports = {
    createAccount,
    getUserAccountsController,
    getAccountBalanceController
}