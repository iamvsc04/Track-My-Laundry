const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { protect, admin, superAdmin } = require("../middlewares/authMiddleware");

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
router.get("/profile", protect, authController.getProfile);
router.put("/profile", protect, authController.updateProfile);
router.put("/change-password", protect, authController.changePassword);
router.put("/notification-preferences", protect, authController.updateNotificationPreferences);

router.post("/create-admin", protect, superAdmin, authController.createAdmin);
router.get("/staff", protect, admin, authController.getStaff);
router.get("/customers", protect, admin, authController.getCustomers);

module.exports = router;
