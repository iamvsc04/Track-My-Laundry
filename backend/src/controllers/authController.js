const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");
const sendSMS = require("../utils/sendSMS");

exports.register = async (req, res) => {
  try {
    const { name, email, mobile, password } = req.body;
    const existingUser = await User.findOne({ $or: [{ email }, { mobile }] });
    if (existingUser)
      return res
        .status(400)
        .json({ message: "Email or mobile already in use" });
    const hashedPassword = await bcrypt.hash(password, 10);
    const emailOTP = Math.floor(100000 + Math.random() * 900000).toString();
    const mobileOTP = Math.floor(100000 + Math.random() * 900000).toString();
    const user = new User({
      name,
      email,
      mobile,
      password: hashedPassword,
      emailOTP,
      mobileOTP,
      emailVerified: false,
      mobileVerified: false,
    });
    await user.save();
    await sendEmail(email, `Your OTP is ${emailOTP}`);
    await sendSMS(mobile, `Your OTP is ${mobileOTP}`);
    res
      .status(201)
      .json({ message: "User registered. OTPs sent to email and mobile." });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { email, emailOTP, mobile, mobileOTP } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    let updated = false;
    if (emailOTP && user.emailOTP === emailOTP) {
      user.emailVerified = true;
      user.emailOTP = null;
      updated = true;
    }
    if (mobileOTP && user.mobileOTP === mobileOTP) {
      user.mobileVerified = true;
      user.mobileOTP = null;
      updated = true;
    }
    if (updated) {
      await user.save();
      return res.json({
        message: "OTP verified",
        emailVerified: user.emailVerified,
        mobileVerified: user.mobileVerified,
      });
    }
    res.status(400).json({ message: "Invalid OTP" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });
    if (!user.emailVerified || !user.mobileVerified) {
      return res.status(403).json({
        message: "Please verify your email and mobile before logging in.",
      });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.sendEmailOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const emailOTP = Math.floor(100000 + Math.random() * 900000).toString();
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    user.emailOTP = emailOTP;
    user.emailVerified = false;
    await user.save();
    await sendEmail(email, `Your OTP is ${emailOTP}`);
    res.json({ message: "OTP sent to email" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to send email OTP", error: err.message });
  }
};

exports.sendMobileOTP = async (req, res) => {
  try {
    const { mobile } = req.body;
    const mobileOTP = Math.floor(100000 + Math.random() * 900000).toString();
    const user = await User.findOne({ mobile });
    if (!user) return res.status(404).json({ message: "User not found" });
    user.mobileOTP = mobileOTP;
    user.mobileVerified = false;
    await user.save();
    await sendSMS(mobile, `Your OTP is ${mobileOTP}`);
    res.json({ message: "OTP sent to mobile" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to send mobile OTP", error: err.message });
  }
};
