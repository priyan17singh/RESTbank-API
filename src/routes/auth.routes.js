const express = require("express");
const {registerUser, loginUser}  = require("../controller/auth.controller");

const router = express.Router();

router.post("/register",registerUser);
router.post("/login",loginUser);
// router.post("/logout",)
// router.post("/register",)

module.exports = router;