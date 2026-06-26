const jwt = require("jsonwebtoken");
require("dotenv").config();
const userModel = require("../models/user.model");
const tokenblacklistModel = require("../models/blacklist.model");

async function authMiddleware(req, res, next) {
  const token = req.cookies.token || req.headers.authorisation?.split(" ")[1];
  if (!token) {
    return res
      .status(401)
      .json({ message: "Unauthorised access. Login to access this feature." });
  }
  const isBlacklisted = await tokenblacklistModel.findOne({ token });
  if (!isBlacklisted) {
    return res
      .status(401)
      .json({ message: "Unauthorised access, token is invalid." });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: "User no longer exists." });
    }
    req.user = user;
    return next();
  } catch (error) {
    return res
      .status(401)
      .json({ message: "Unauthorised access, token is invalid." });
  }
}

async function authSystemMiddleware(req, res, next) {
  const token = req.cookies.token || req.headers.authorisation?.split(" ")[1];
  if (!token) {
    return res
      .status(401)
      .json({ message: "Unauthorised access. Login to access this feature." });
  }
  const isBlacklisted = await tokenblacklistModel.findOne({ token });
  if (!isBlacklisted) {
    return res
      .status(401)
      .json({ message: "Unauthorised access, token is invalid." });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(decoded.userId).select("+systemUser");
    if (!user.systemUser) {
      return res
        .status(403)
        .json({ message: "Forbidden access. Not a system user." });
    }
    req.user = user;
    return next();
  } catch (error) {
    return res
      .status(401)
      .json({ message: "Unauthorised access, token is invalid." });
  }
}

module.exports = { authMiddleware, authSystemMiddleware };
