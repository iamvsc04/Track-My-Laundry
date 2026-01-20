const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const auth = require("../middlewares/authMiddleware");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/verify-otp", authController.verifyOTP);
router.post("/send-email-otp", authController.sendEmailOTP);
router.post("/send-mobile-otp", authController.sendMobileOTP);
router.post("/verify-email-otp", authController.verifyEmailOnly);
router.post("/verify-mobile-otp", authController.verifyMobileOnly);
router.get("/verify-email", authController.verifyEmailOnly);
router.post(
  "/resend-verification-email",
  authController.resendVerificationEmail
);

// Protected routes
router.get("/profile", auth, authController.getProfile);
router.put("/profile", auth, authController.updateProfile);
router.put("/change-password", auth, authController.changePassword);
router.put("/notification-preferences", auth, authController.updateNotificationPreferences);

module.exports = router;
