const express = require("express");
const {registerUser, loginUser, logout}  = require("../controller/auth.controller");

const router = express.Router();

router.post("/register",registerUser);
router.post("/login",loginUser);
router.post("/logout",logout);


module.exports = router;