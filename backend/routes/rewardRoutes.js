const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const rewardController = require("../controllers/rewardController");

// All routes require authentication
router.use(protect);

// User loyalty profile
router.get("/profile", rewardController.getLoyaltyProfile);

// Rewards history
router.get("/history", rewardController.getRewardsHistory);

// Redemption options
router.get("/redemptions/options", rewardController.getRedemptionOptions);
router.get("/options", rewardController.getRedemptionOptions);

// Redeem points
router.post("/redeem", rewardController.redeemPoints);

// Redemption history
router.get("/redemptions/history", rewardController.getRedemptionHistory);
router.get("/redemption-history", rewardController.getRedemptionHistory);

// Process referral
router.post("/referral", rewardController.processReferral);

// Leaderboard
router.get("/leaderboard", rewardController.getLeaderboard);

// Achievement progress
router.get("/achievements", rewardController.getAchievementProgress);

// Update FCM token
router.post("/fcm-token", rewardController.updateFCMToken);

// Admin routes
router.get("/analytics", rewardController.getRewardsAnalytics);

module.exports = router;
