const express = require("express");
const {createTransaction, createInitialFundsTransaction}  = require("../controller/transaction.controller");
const {authMiddleware, authSystemMiddleware} = require("../middleware/auth.middleware");

const router = express.Router();

/**
 * Protected routes
 * 
 * 
 */

router.post("/create",authMiddleware,createTransaction);
router.post("/system/initiate-funds", authSystemMiddleware, createInitialFundsTransaction);


module.exports = router;