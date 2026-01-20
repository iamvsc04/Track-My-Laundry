const rewardService = require('../services/rewardService');
const { Reward, LoyaltyProfile, Redemption } = require('../models/Reward');

// Get user's loyalty profile
exports.getLoyaltyProfile = async (req, res) => {
  try {
    const profile = await rewardService.getLoyaltyProfile(req.user.id);
    res.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error('Error fetching loyalty profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch loyalty profile',
      error: error.message,
    });
  }
};

// Get user's rewards history
exports.getRewardsHistory = async (req, res) => {
  try {
    const { page = 1, limit = 20, type } = req.query;
    const history = await rewardService.getRewardsHistory(req.user.id, {
      page: parseInt(page),
      limit: parseInt(limit),
      type,
    });
    
    res.json({
      success: true,
      data: history,
    });
  } catch (error) {
    console.error('Error fetching rewards history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch rewards history',
      error: error.message,
    });
  }
};

// Get available redemption options
exports.getRedemptionOptions = async (req, res) => {
  try {
    const options = rewardService.getRedemptionOptions();
    res.json({
      success: true,
      data: options,
    });
  } catch (error) {
    console.error('Error fetching redemption options:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch redemption options',
      error: error.message,
    });
  }
};

// Redeem points
exports.redeemPoints = async (req, res) => {
  try {
    const { type, pointsCost, title, description, cashValue, discountPercentage } = req.body;
    
    if (!type || !pointsCost || !title) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: type, pointsCost, title',
      });
    }

    const redemption = await rewardService.redeemPoints(req.user.id, {
      type,
      pointsCost,
      title,
      description,
      cashValue,
      discountPercentage,
    });

    res.json({
      success: true,
      message: 'Points redeemed successfully',
      data: redemption,
    });
  } catch (error) {
    console.error('Error redeeming points:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to redeem points',
    });
  }
};

// Get user's redemption history
exports.getRedemptionHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const query = { user: req.user.id };
    
    if (status && status !== 'all') {
      query.status = status;
    }

    const redemptions = await Redemption.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('appliedToOrder', 'orderNumber status');

    const total = await Redemption.countDocuments(query);

    res.json({
      success: true,
      data: {
        redemptions,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        total,
      },
    });
  } catch (error) {
    console.error('Error fetching redemption history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch redemption history',
      error: error.message,
    });
  }
};

// Process referral (when someone uses referral code)
exports.processReferral = async (req, res) => {
  try {
    const { referralCode } = req.body;
    
    if (!referralCode) {
      return res.status(400).json({
        success: false,
        message: 'Referral code is required',
      });
    }

    // Find referrer by referral code
    const referrerProfile = await LoyaltyProfile.findOne({ referralCode });
    if (!referrerProfile) {
      return res.status(404).json({
        success: false,
        message: 'Invalid referral code',
      });
    }

    // Check if current user was already referred
    const currentUserProfile = await LoyaltyProfile.findOne({ user: req.user.id });
    if (currentUserProfile && currentUserProfile.referredBy) {
      return res.status(400).json({
        success: false,
        message: 'You have already used a referral code',
      });
    }

    // Process the referral
    const result = await rewardService.processReferral(referrerProfile.user, req.user.id);

    res.json({
      success: true,
      message: 'Referral processed successfully',
      data: result,
    });
  } catch (error) {
    console.error('Error processing referral:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process referral',
      error: error.message,
    });
  }
};

// Get leaderboard
exports.getLeaderboard = async (req, res) => {
  try {
    const { type = 'points', period = 'all', limit = 10 } = req.query;
    
    let matchCondition = {};
    let sortField = 'totalPointsEarned';
    
    // Set sort field based on type
    switch (type) {
      case 'orders':
        sortField = 'stats.totalOrders';
        break;
      case 'spending':
        sortField = 'stats.totalSpent';
        break;
      case 'streak':
        sortField = 'longestStreak';
        break;
      case 'referrals':
        sortField = 'referralsCount';
        break;
      default:
        sortField = 'totalPointsEarned';
    }

    // Add period filter if needed
    if (period !== 'all') {
      const periodDays = period === 'week' ? 7 : period === 'month' ? 30 : 365;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - periodDays);
      matchCondition.updatedAt = { $gte: startDate };
    }

    const leaderboard = await LoyaltyProfile.find(matchCondition)
      .sort({ [sortField]: -1 })
      .limit(parseInt(limit))
      .populate('user', 'name email')
      .select('user totalPointsEarned currentLevel levelName stats longestStreak referralsCount');

    // Add ranking
    const rankedLeaderboard = leaderboard.map((profile, index) => ({
      rank: index + 1,
      user: profile.user,
      totalPointsEarned: profile.totalPointsEarned,
      currentLevel: profile.currentLevel,
      levelName: profile.levelName,
      stats: profile.stats,
      longestStreak: profile.longestStreak,
      referralsCount: profile.referralsCount,
    }));

    res.json({
      success: true,
      data: {
        leaderboard: rankedLeaderboard,
        type,
        period,
      },
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leaderboard',
      error: error.message,
    });
  }
};

// Get user's achievement progress
exports.getAchievementProgress = async (req, res) => {
  try {
    const profile = await LoyaltyProfile.findOne({ user: req.user.id });
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Loyalty profile not found',
      });
    }

    // Get all available achievements with progress
    const achievements = rewardService.achievementDefinitions.map(achievement => {
      const isUnlocked = profile.achievements.find(a => a.id === achievement.id);
      const progress = this.calculateAchievementProgress(achievement, profile);
      
      return {
        ...achievement,
        isUnlocked: !!isUnlocked,
        unlockedAt: isUnlocked?.unlockedAt,
        progress: Math.min(progress, 100),
      };
    });

    res.json({
      success: true,
      data: {
        achievements,
        unlockedCount: profile.achievements.length,
        totalCount: rewardService.achievementDefinitions.length,
      },
    });
  } catch (error) {
    console.error('Error fetching achievement progress:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch achievement progress',
      error: error.message,
    });
  }
};

// Helper method to calculate achievement progress
exports.calculateAchievementProgress = (achievement, profile) => {
  // This is a simplified calculation - you might need more complex logic
  switch (achievement.id) {
    case 'first_order':
      return profile.stats.totalOrders >= 1 ? 100 : 0;
    case 'regular_customer':
      return Math.min((profile.stats.totalOrders / 10) * 100, 100);
    case 'loyal_customer':
      return Math.min((profile.stats.totalOrders / 25) * 100, 100);
    case 'vip_customer':
      return Math.min((profile.stats.totalOrders / 50) * 100, 100);
    case 'big_spender':
      return Math.min((profile.stats.totalSpent / 5000) * 100, 100);
    case 'premium_customer':
      return Math.min((profile.stats.totalSpent / 10000) * 100, 100);
    case 'streak_master':
      return Math.min((profile.longestStreak / 5) * 100, 100);
    case 'consistency_king':
      return Math.min((profile.longestStreak / 10) * 100, 100);
    case 'eco_warrior':
      return Math.min((profile.stats.ecoFriendlyChoices / 5) * 100, 100);
    case 'green_champion':
      return Math.min((profile.stats.ecoFriendlyChoices / 15) * 100, 100);
    case 'reviewer':
      return Math.min((profile.stats.reviewsCount / 5) * 100, 100);
    case 'friend_magnet':
      return Math.min((profile.referralsCount / 3) * 100, 100);
    default:
      return 0;
  }
};

// Update FCM token for push notifications
exports.updateFCMToken = async (req, res) => {
  try {
    const { fcmToken } = req.body;
    
    if (!fcmToken) {
      return res.status(400).json({
        success: false,
        message: 'FCM token is required',
      });
    }

    const User = require('../models/User');
    await User.findByIdAndUpdate(req.user.id, { fcmToken });

    res.json({
      success: true,
      message: 'FCM token updated successfully',
    });
  } catch (error) {
    console.error('Error updating FCM token:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update FCM token',
      error: error.message,
    });
  }
};

// Admin: Get rewards analytics
exports.getRewardsAnalytics = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin' && req.user.role !== 'super-admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.',
      });
    }

    const { period = '30d' } = req.query;
    const periodDays = parseInt(period.replace('d', ''));
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodDays);

    // Get rewards statistics
    const totalRewards = await Reward.countDocuments();
    const rewardsInPeriod = await Reward.countDocuments({
      createdAt: { $gte: startDate }
    });

    const totalPointsAwarded = await Reward.aggregate([
      { $group: { _id: null, total: { $sum: '$points' } } }
    ]);

    const totalPointsRedeemed = await Redemption.aggregate([
      { $group: { _id: null, total: { $sum: '$pointsCost' } } }
    ]);

    // Get top users by points
    const topUsers = await LoyaltyProfile.find()
      .sort({ totalPointsEarned: -1 })
      .limit(10)
      .populate('user', 'name email');

    // Get reward distribution by type
    const rewardsByType = await Reward.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 }, points: { $sum: '$points' } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalRewards,
          rewardsInPeriod,
          totalPointsAwarded: totalPointsAwarded[0]?.total || 0,
          totalPointsRedeemed: totalPointsRedeemed[0]?.total || 0,
        },
        topUsers,
        rewardsByType,
        period,
      },
    });
  } catch (error) {
    console.error('Error fetching rewards analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch rewards analytics',
      error: error.message,
    });
  }
};
