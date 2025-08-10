const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/verify-otp", authController.verifyOTP);
router.post("/send-email-otp", authController.sendEmailOTP);
router.post("/send-mobile-otp", authController.sendMobileOTP);

module.exports = router;
