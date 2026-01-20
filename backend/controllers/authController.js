const User = require("../models/User");
const Verification = require("../models/Verification");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");
const sendSMS = require("../utils/sendSMS");
const crypto = require("crypto");

// Generate a unique 6-digit OTP for email verification among non-expired records
async function generateUniqueEmailOtp() {
  const now = new Date();
  for (let i = 0; i < 5; i += 1) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const exists = await Verification.findOne({
      contactType: "email",
      otp,
      expiresAt: { $gt: now },
    }).lean();
    if (!exists) return otp;
  }
  // Extremely unlikely fallback: 7-digit OTP
  return Math.floor(1000000 + Math.random() * 9000000).toString();
}

exports.register = async (req, res, next) => {
  try {
    const { name, email, mobile, password } = req.body;
    console.log(`[Registration] Attempt for email: ${email}, mobile: ${mobile}`);

    // Check duplicates
    const existingUser = await User.findOne({ $or: [{ email }, { mobile }] });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Email or mobile already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      mobile,
      password: hashedPassword,
      emailVerified: false,
      mobileVerified: true,
      emailOTP: null,
      mobileOTP: null,
    });
    await user.save();
    console.log(`[Registration] User saved successfully: ${user._id}`);

    // Send email verification link
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await Verification.findOneAndUpdate(
      { contactType: "email", contactValue: email, purpose: "register" },
      { otp: token, verified: false, expiresAt },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const backendBase =
      process.env.BACKEND_BASE_URL ||
      `http://localhost:${process.env.PORT || 5000}`;
    const verifyUrl = `${backendBase}/api/auth/verify-email?email=${encodeURIComponent(
      email
    )}&token=${token}`;
    await sendEmail(
      email,
      `Welcome to TrackMyLaundry! Click the link to verify your email: ${verifyUrl}\nThis link expires in 1 hour.`
    );
    console.log(`[Registration] Verification email sent to: ${email}`);

    res.status(201).json({
      message:
        "Registration successful. Please check your email to verify your account.",
    });
  } catch (err) {
    console.error("[Registration] Error during registration:", err);
    next(err);
  }
};

// Backward compatible combined verification for existing users
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
    if (!user.emailVerified) {
      return res.status(403).json({
        message: "Please verify your email before logging in.",
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

// Send email verification OTP (unique) via nodemailer
exports.sendEmailOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    // Allow sending OTP for new users and for existing unverified users
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.emailVerified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    const otp = await generateUniqueEmailOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await Verification.findOneAndUpdate(
      { contactType: "email", contactValue: email, purpose: "register" },
      { otp, verified: false, expiresAt },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await sendEmail(
      email,
      `Your TrackMyLaundry email OTP is ${otp}. It expires in 10 minutes.`
    );
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
    if (!mobile) return res.status(400).json({ message: "Mobile is required" });

    // Prevent verifying an already-registered mobile number
    const existingUser = await User.findOne({ mobile });
    if (existingUser) {
      return res.status(400).json({ message: "Mobile already in use" });
    }

    const mobileOTP = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await Verification.findOneAndUpdate(
      { contactType: "mobile", contactValue: mobile, purpose: "register" },
      { otp: mobileOTP, verified: false, expiresAt },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await sendSMS(
      mobile,
      `Your TrackMyLaundry mobile OTP is ${mobileOTP}. It expires in 10 minutes.`
    );
    res.json({ message: "OTP sent to mobile" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to send mobile OTP", error: err.message });
  }
};

// Email verification via link (token) or OTP
exports.verifyEmailOnly = async (req, res) => {
  try {
    const email =
      (req.query && req.query.email) || (req.body && req.body.email);
    const token =
      (req.query && req.query.token) || (req.body && req.body.token);
    const otp = (req.body && req.body.otp) || (req.query && req.query.otp);

    console.log("Verification attempt:", {
      email,
      token,
      otp,
      method: req.method,
    });

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    if (!token && !otp) {
      return res.status(400).json({ message: "Token or OTP is required" });
    }

    const record = await Verification.findOne({
      contactType: "email",
      contactValue: email,
      purpose: "register",
    });

    console.log(
      "Found record:",
      record ? "yes" : "no",
      record
        ? {
            id: record._id,
            verified: record.verified,
            expiresAt: record.expiresAt,
          }
        : "none"
    );

    if (!record) {
      return res
        .status(404)
        .json({ message: "No verification requested for this email" });
    }

    if (record.expiresAt < new Date()) {
      return res.status(400).json({ message: "Verification expired" });
    }

    // Check if the provided token/otp matches the stored one
    if (token && record.otp !== token) {
      return res.status(400).json({ message: "Invalid verification token" });
    }

    if (otp && record.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    record.verified = true;
    await record.save();

    // If user already exists (e.g. link resend), mark verified
    const user = await User.findOne({ email });
    if (user) {
      user.emailVerified = true;
      await user.save();
    }

    // If request is a browser link GET, show a simple HTML response
    if (req.method === "GET") {
      return res.send(
        "Email verified successfully. You can close this window and return to the app."
      );
    }

    res.json({ message: "Email verified" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.verifyMobileOnly = async (req, res) => {
  try {
    const { mobile, otp } = req.body;
    if (!mobile || !otp)
      return res.status(400).json({ message: "Mobile and OTP are required" });
    const record = await Verification.findOne({
      contactType: "mobile",
      contactValue: mobile,
      purpose: "register",
    });
    if (!record)
      return res
        .status(404)
        .json({ message: "No OTP requested for this mobile" });
    if (record.expiresAt < new Date())
      return res.status(400).json({ message: "OTP expired" });
    if (record.otp !== otp)
      return res.status(400).json({ message: "Invalid OTP" });
    record.verified = true;
    await record.save();
    res.json({ message: "Mobile verified" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Resend email verification link for existing unverified users
exports.resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.emailVerified) {
      return res.status(400).json({ message: "Email is already verified" });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await Verification.findOneAndUpdate(
      { contactType: "email", contactValue: email, purpose: "register" },
      { otp: token, verified: false, expiresAt },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const backendBase =
      process.env.BACKEND_BASE_URL ||
      `http://localhost:${process.env.PORT || 5000}`;
    const verifyUrl = `${backendBase}/api/auth/verify-email?email=${encodeURIComponent(
      email
    )}&token=${token}`;

    await sendEmail(
      email,
      `Verify your TrackMyLaundry account: ${verifyUrl}\nThis link expires in 1 hour.`
    );
    res.json({ message: "Verification email resent" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, mobile, profile } = req.body;
    const userId = req.user.id;
    
    // Check if email or mobile already exists for other users
    if (email || mobile) {
      const existingUser = await User.findOne({
        $and: [
          { _id: { $ne: userId } },
          { $or: [{ email }, { mobile }] }
        ]
      });
      
      if (existingUser) {
        return res.status(400).json({ 
          message: "Email or mobile already in use by another user" 
        });
      }
    }
    
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (mobile) updateData.mobile = mobile;
    if (profile) updateData.profile = profile;
    
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("-password");
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json({ 
      message: "Profile updated successfully",
      user 
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        message: "Current password and new password are required" 
      });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }
    
    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password
    await User.findByIdAndUpdate(userId, { 
      password: hashedNewPassword 
    });
    
    res.json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Update notification preferences
exports.updateNotificationPreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const preferences = req.body;
    
    const updateData = {};
    if (preferences.email !== undefined) updateData["notifications.email"] = preferences.email;
    if (preferences.sms !== undefined) updateData["notifications.sms"] = preferences.sms;
    if (preferences.push !== undefined) updateData["notifications.push"] = preferences.push;
    if (preferences.orderUpdates !== undefined) updateData["notifications.orderUpdates"] = preferences.orderUpdates;
    if (preferences.promotions !== undefined) updateData["notifications.promotions"] = preferences.promotions;
    if (preferences.rewards !== undefined) updateData["notifications.rewards"] = preferences.rewards;
    if (preferences.reminders !== undefined) updateData["notifications.reminders"] = preferences.reminders;
    
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true }
    ).select("notifications");
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json({
      message: "Notification preferences updated successfully",
      preferences: user.notifications
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
