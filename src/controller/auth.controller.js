const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const { sendRegistrationEmail } = require("../services/email.service");
const tokenblacklistModel = require("../models/blacklist.model");

async function registerUser(req, res) {
  const { email, name, password } = req.body;
  if (!email || !name || !password) {
    return res.status(400).json({
      status: "Failed",
      message: "All fields are required.",
    });
  }

  const isUserPresent = await userModel.findOne({ email: email });
  if (isUserPresent) {
    return res
      .status(409)
      .json({ message: "User already exists.", status: "Failed" });
  }

  const user = await userModel.create({ email, name, password });
  const token = jwt.sign(
    {
      userId: user._id,
    },
    process.env.JWT_SECRET,
  );
  res.cookie("token", token, {
    // httpOnly: true,
    // secure: true,
    // sameSite: 'strict',
    maxAge: 3 * 24 * 60 * 60 * 1000, // 7 days
  });
  res.status(201).json({
    message: "User registered successfully.",
    user,
  });
  await sendRegistrationEmail(user.email, user.name);
}

async function loginUser(req, res) {
  const { email, password } = req.body;

  const user = await userModel.findOne({ email: email }).select("+password");
  if (!user) {
    return res.status(409).json({ message: "User does not exists." });
  }

  const isPasswordCorrect = await user.comparePassword(password);

  if (!isPasswordCorrect) {
    return res.status(401).json({ message: "Wrong credentials." });
  }
  const token = jwt.sign(
    {
      userId: user._id,
    },
    process.env.JWT_SECRET,
  );
  res.cookie("token", token, {
    // httpOnly: true,
    // secure: true,
    // sameSite: 'strict',
    maxAge: 3 * 24 * 60 * 60 * 1000, // 7 days
  });
  res.status(200).json({
    message: "User logged in successfully.",
    user,
  });
}

async function logout(req, res) {
  const token = req.cookies.token || req.headers.authorisation?.split(" ")[1];
  if (!token) {
    return res
      .status(401)
      .json({ message: "Unauthorised access. Can't log out without Login." });
  }
   res.clearCookie("token")
  await tokenblacklistModel.create({token});

  res.status(200).json({message: "User logged out successfully."});

}

module.exports = { registerUser, loginUser, logout };
