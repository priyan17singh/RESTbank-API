const express = require("express");
const {createAccount, getAccountBalanceController, getUserAccountsController}  = require("../controller/account.controller");
const {authMiddleware} = require("../middleware/auth.middleware");

const router = express.Router();



router.get("/myAccounts",authMiddleware,getUserAccountsController);
router.get("/balance",authMiddleware,getAccountBalanceController);
router.post("/create",authMiddleware,createAccount);

module.exports = router;