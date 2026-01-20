const { Reward, LoyaltyProfile, Redemption } = require('../models/Reward');
const User = require('../models/User');
const Order = require('../models/Order');
const notificationService = require('./notificationService');

class RewardService {
  constructor() {
    this.achievementDefinitions = this.initializeAchievements();
    this.pointsConfig = {
      orderCompletion: 50,
      firstOrder: 200,
      referralBonus: 500,
      referralReward: 100,
      reviewReward: 25,
      streakMultiplier: 1.2,
      ecoFriendlyBonus: 30,
      levelUpBonus: 100,
    };
  }

  initializeAchievements() {
    return [
      // Order-based achievements
      {
        id: 'first_order',
        name: 'First Steps',
        description: 'Complete your first order with TrackMyLaundry',
        condition: (stats) => stats.totalOrders >= 1,
        points: 200,
        icon: '🎉',
        rarity: 'common'
      },
      {
        id: 'regular_customer',
        name: 'Regular Customer',
        description: 'Complete 10 orders',
        condition: (stats) => stats.totalOrders >= 10,
        points: 500,
        icon: '⭐',
        rarity: 'rare'
      },
      {
        id: 'loyal_customer',
        name: 'Loyal Customer',
        description: 'Complete 25 orders',
        condition: (stats) => stats.totalOrders >= 25,
        points: 1000,
        icon: '👑',
        rarity: 'epic'
      },
      {
        id: 'vip_customer',
        name: 'VIP Customer',
        description: 'Complete 50 orders',
        condition: (stats) => stats.totalOrders >= 50,
        points: 2000,
        icon: '💎',
        rarity: 'legendary'
      },
      
      // Spending-based achievements
      {
        id: 'big_spender',
        name: 'Big Spender',
        description: 'Spend ₹5,000 in total',
        condition: (stats) => stats.totalSpent >= 5000,
        points: 750,
        icon: '💰',
        rarity: 'rare'
      },
      {
        id: 'premium_customer',
        name: 'Premium Customer',
        description: 'Spend ₹10,000 in total',
        condition: (stats) => stats.totalSpent >= 10000,
        points: 1500,
        icon: '🏆',
        rarity: 'epic'
      },
      
      // Streak-based achievements
      {
        id: 'streak_master',
        name: 'Streak Master',
        description: 'Maintain a 5-order streak',
        condition: (stats, profile) => profile.longestStreak >= 5,
        points: 300,
        icon: '🔥',
        rarity: 'rare'
      },
      {
        id: 'consistency_king',
        name: 'Consistency King',
        description: 'Maintain a 10-order streak',
        condition: (stats, profile) => profile.longestStreak >= 10,
        points: 800,
        icon: '⚡',
        rarity: 'epic'
      },
      
      // Eco-friendly achievements
      {
        id: 'eco_warrior',
        name: 'Eco Warrior',
        description: 'Choose eco-friendly options 5 times',
        condition: (stats) => stats.ecoFriendlyChoices >= 5,
        points: 400,
        icon: '🌱',
        rarity: 'rare'
      },
      {
        id: 'green_champion',
        name: 'Green Champion',
        description: 'Choose eco-friendly options 15 times',
        condition: (stats) => stats.ecoFriendlyChoices >= 15,
        points: 1000,
        icon: '🌍',
        rarity: 'epic'
      },
      
      // Review achievements
      {
        id: 'reviewer',
        name: 'Helpful Reviewer',
        description: 'Leave 5 reviews',
        condition: (stats) => stats.reviewsCount >= 5,
        points: 250,
        icon: '⭐',
        rarity: 'common'
      },
      
      // Referral achievements
      {
        id: 'friend_magnet',
        name: 'Friend Magnet',
        description: 'Refer 3 friends successfully',
        condition: (stats, profile) => profile.referralsCount >= 3,
        points: 1500,
        icon: '🤝',
        rarity: 'epic'
      }
    ];
  }

  // Initialize loyalty profile for new user
  async initializeLoyaltyProfile(userId) {
    try {
      let profile = await LoyaltyProfile.findOne({ user: userId });
      if (!profile) {
        profile = new LoyaltyProfile({ user: userId });
        await profile.save();
      }
      return profile;
    } catch (error) {
      console.error('Error initializing loyalty profile:', error);
      throw error;
    }
  }

  // Award points for various actions
  async awardPoints(userId, type, points, metadata = {}) {
    try {
      const profile = await this.initializeLoyaltyProfile(userId);
      const previousLevel = profile.currentLevel;

      // Create reward record
      const reward = new Reward({
        user: userId,
        type,
        title: this.getRewardTitle(type),
        description: this.getRewardDescription(type, metadata),
        points,
        source: metadata,
        expiresAt: this.calculateExpiry(type),
      });

      await reward.save();

      // Update loyalty profile
      profile.totalPointsEarned += points;
      profile.availablePoints += points;
      profile.calculateLevel();
      
      await profile.save();

      // Check for level up
      if (profile.currentLevel > previousLevel) {
        await this.handleLevelUp(userId, profile, previousLevel);
      }

      // Check for new achievements
      await this.checkAchievements(userId, profile);

      // Send notification
      await notificationService.createNotification(userId, {
        title: `${points} Points Earned!`,
        message: `You've earned ${points} points for ${this.getRewardTitle(type).toLowerCase()}`,
        type: 'reward',
        priority: 'medium',
        actionUrl: '/profile/rewards',
        actionText: 'View Rewards',
      });

      return reward;
    } catch (error) {
      console.error('Error awarding points:', error);
      throw error;
    }
  }

  // Handle order completion rewards
  async processOrderCompletion(order) {
    try {
      const userId = order.user;
      const profile = await this.initializeLoyaltyProfile(userId);
      
      // Update stats
      profile.stats.totalOrders += 1;
      profile.stats.totalSpent += order.total;
      
      // Check for eco-friendly choices
      if (order.customerPreferences?.detergentType === 'Eco-friendly') {
        profile.stats.ecoFriendlyChoices += 1;
        await this.awardPoints(userId, 'eco_warrior', this.pointsConfig.ecoFriendlyBonus, {
          orderId: order._id,
        });
      }

      // Update streak
      const now = new Date();
      const lastOrderDate = profile.lastOrderDate;
      const daysDifference = lastOrderDate ? 
        Math.floor((now - lastOrderDate) / (1000 * 60 * 60 * 24)) : 0;

      if (!lastOrderDate || daysDifference <= 7) {
        // Continue or start streak (within 7 days)
        profile.currentStreak += 1;
        profile.longestStreak = Math.max(profile.longestStreak, profile.currentStreak);
      } else {
        // Reset streak
        profile.currentStreak = 1;
      }
      
      profile.lastOrderDate = now;
      await profile.save();

      // Base points for order completion
      let basePoints = this.pointsConfig.orderCompletion;
      
      // Streak multiplier
      if (profile.currentStreak >= 3) {
        basePoints = Math.floor(basePoints * Math.pow(this.pointsConfig.streakMultiplier, profile.currentStreak - 2));
      }

      // First order bonus
      if (profile.stats.totalOrders === 1) {
        basePoints += this.pointsConfig.firstOrder;
        await this.awardPoints(userId, 'first_order', this.pointsConfig.firstOrder, {
          orderId: order._id,
        });
      }

      // Award base completion points
      await this.awardPoints(userId, 'points', basePoints, {
        orderId: order._id,
        streak: profile.currentStreak,
      });

      // Streak bonus
      if (profile.currentStreak >= 5) {
        const streakBonus = Math.floor(basePoints * 0.5);
        await this.awardPoints(userId, 'streak_bonus', streakBonus, {
          orderId: order._id,
          streak: profile.currentStreak,
        });
      }

      return profile;
    } catch (error) {
      console.error('Error processing order completion rewards:', error);
      throw error;
    }
  }

  // Handle referral system
  async processReferral(referrerUserId, newUserId) {
    try {
      // Update referrer's profile
      const referrerProfile = await this.initializeLoyaltyProfile(referrerUserId);
      referrerProfile.referralsCount += 1;
      referrerProfile.referralPointsEarned += this.pointsConfig.referralBonus;
      await referrerProfile.save();

      // Award points to referrer
      await this.awardPoints(referrerUserId, 'referral_bonus', this.pointsConfig.referralBonus, {
        referralId: newUserId,
      });

      // Set up new user's profile
      const newUserProfile = await this.initializeLoyaltyProfile(newUserId);
      newUserProfile.referredBy = referrerUserId;
      await newUserProfile.save();

      // Award welcome bonus to new user
      await this.awardPoints(newUserId, 'points', this.pointsConfig.referralReward, {
        referralId: referrerUserId,
        isWelcomeBonus: true,
      });

      return { referrerProfile, newUserProfile };
    } catch (error) {
      console.error('Error processing referral:', error);
      throw error;
    }
  }

  // Check and unlock achievements
  async checkAchievements(userId, profile = null) {
    try {
      if (!profile) {
        profile = await LoyaltyProfile.findOne({ user: userId });
        if (!profile) return [];
      }

      const newAchievements = [];

      for (const achievement of this.achievementDefinitions) {
        const hasAchievement = profile.achievements.find(a => a.id === achievement.id);
        if (!hasAchievement && achievement.condition(profile.stats, profile)) {
          const achievementData = {
            id: achievement.id,
            name: achievement.name,
            description: achievement.description,
            points: achievement.points,
            icon: achievement.icon,
            rarity: achievement.rarity,
            unlockedAt: new Date(),
          };

          const added = profile.addAchievement(achievementData);
          if (added) {
            newAchievements.push(achievementData);
            
            // Award achievement points
            await this.awardPoints(userId, 'loyalty_milestone', achievement.points, {
              achievementId: achievement.id,
            });

            // Send achievement notification
            await notificationService.createNotification(userId, {
              title: `Achievement Unlocked! ${achievement.icon}`,
              message: `Congratulations! You've unlocked "${achievement.name}" - ${achievement.description}`,
              type: 'achievement',
              priority: 'high',
              actionUrl: '/profile/achievements',
              actionText: 'View Achievements',
            });
          }
        }
      }

      if (newAchievements.length > 0) {
        await profile.save();
      }

      return newAchievements;
    } catch (error) {
      console.error('Error checking achievements:', error);
      throw error;
    }
  }

  // Handle level up
  async handleLevelUp(userId, profile, previousLevel) {
    try {
      const levelUpBonus = this.pointsConfig.levelUpBonus * profile.currentLevel;
      
      await this.awardPoints(userId, 'loyalty_milestone', levelUpBonus, {
        levelUp: true,
        previousLevel,
        newLevel: profile.currentLevel,
      });

      await notificationService.createNotification(userId, {
        title: `Level Up! ${profile.levelName} 🎉`,
        message: `Congratulations! You've reached ${profile.levelName} level and earned ${levelUpBonus} bonus points!`,
        type: 'level_up',
        priority: 'high',
        actionUrl: '/profile/rewards',
        actionText: 'View Profile',
      });
    } catch (error) {
      console.error('Error handling level up:', error);
      throw error;
    }
  }

  // Redeem points
  async redeemPoints(userId, redemptionData) {
    try {
      const { type, pointsCost, title, description, cashValue, discountPercentage } = redemptionData;
      
      const profile = await LoyaltyProfile.findOne({ user: userId });
      if (!profile) {
        throw new Error('Loyalty profile not found');
      }

      if (profile.availablePoints < pointsCost) {
        throw new Error('Insufficient points');
      }

      // Create redemption record
      const redemption = new Redemption({
        user: userId,
        type,
        title,
        description,
        pointsCost,
        cashValue,
        discountPercentage,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days validity
      });

      // Generate coupon code if applicable
      if (['discount', 'free_service'].includes(type)) {
        redemption.couponCode = 'REWARD' + Date.now().toString(36).toUpperCase();
      }

      await redemption.save();

      // Update profile points
      profile.availablePoints -= pointsCost;
      profile.redeemedPoints += pointsCost;
      await profile.save();

      // Send notification
      await notificationService.createNotification(userId, {
        title: 'Points Redeemed Successfully!',
        message: `You've redeemed ${pointsCost} points for ${title}`,
        type: 'redemption',
        priority: 'high',
        actionUrl: '/profile/redemptions',
        actionText: 'View Redemptions',
      });

      return redemption;
    } catch (error) {
      console.error('Error redeeming points:', error);
      throw error;
    }
  }

  // Get user's loyalty profile
  async getLoyaltyProfile(userId) {
    try {
      let profile = await LoyaltyProfile.findOne({ user: userId });
      if (!profile) {
        profile = await this.initializeLoyaltyProfile(userId);
      }
      return profile;
    } catch (error) {
      console.error('Error getting loyalty profile:', error);
      throw error;
    }
  }

  // Get user's rewards history
  async getRewardsHistory(userId, options = {}) {
    try {
      const { page = 1, limit = 20, type } = options;
      const query = { user: userId };
      
      if (type) {
        query.type = type;
      }

      const rewards = await Reward.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip((page - 1) * limit)
        .populate('source.orderId', 'orderNumber')
        .populate('source.referralId', 'name email');

      const total = await Reward.countDocuments(query);

      return {
        rewards,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total,
      };
    } catch (error) {
      console.error('Error getting rewards history:', error);
      throw error;
    }
  }

  // Get available redemption options
  getRedemptionOptions() {
    return [
      {
        type: 'discount',
        title: '₹50 Off Your Next Order',
        description: 'Get ₹50 discount on orders above ₹300',
        pointsCost: 500,
        cashValue: 50,
        discountPercentage: null,
        minOrderValue: 300,
      },
      {
        type: 'discount',
        title: '₹100 Off Your Next Order',
        description: 'Get ₹100 discount on orders above ₹500',
        pointsCost: 900,
        cashValue: 100,
        discountPercentage: null,
        minOrderValue: 500,
      },
      {
        type: 'discount',
        title: '15% Off Your Next Order',
        description: 'Get 15% discount on any order',
        pointsCost: 750,
        cashValue: null,
        discountPercentage: 15,
        minOrderValue: 200,
      },
      {
        type: 'free_service',
        title: 'Free Premium Ironing',
        description: 'Get premium ironing service for free',
        pointsCost: 400,
        cashValue: 100,
        discountPercentage: null,
      },
      {
        type: 'cash_credit',
        title: 'Wallet Credit ₹25',
        description: 'Add ₹25 to your wallet',
        pointsCost: 300,
        cashValue: 25,
        discountPercentage: null,
      },
    ];
  }

  // Helper methods
  getRewardTitle(type) {
    const titles = {
      points: 'Order Completion',
      streak_bonus: 'Streak Bonus',
      referral_bonus: 'Referral Bonus',
      first_order: 'First Order Bonus',
      loyalty_milestone: 'Loyalty Milestone',
      seasonal_bonus: 'Seasonal Bonus',
      review_reward: 'Review Reward',
      eco_warrior: 'Eco-Friendly Choice',
    };
    return titles[type] || 'Reward';
  }

  getRewardDescription(type, metadata = {}) {
    const descriptions = {
      points: `Points earned for completing order ${metadata.orderId ? '#' + metadata.orderId : ''}`,
      streak_bonus: `Bonus points for maintaining a ${metadata.streak}-order streak!`,
      referral_bonus: 'Bonus points for referring a friend',
      first_order: 'Welcome bonus for your first order!',
      loyalty_milestone: 'Achievement unlocked!',
      seasonal_bonus: 'Special seasonal reward',
      review_reward: 'Thank you for your review!',
      eco_warrior: 'Reward for choosing eco-friendly options',
    };
    return descriptions[type] || 'Reward earned';
  }

  calculateExpiry(type) {
    // Most rewards expire in 1 year
    const defaultExpiry = new Date();
    defaultExpiry.setFullYear(defaultExpiry.getFullYear() + 1);
    
    const expiryMap = {
      seasonal_bonus: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
      review_reward: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 180 days
    };

    return expiryMap[type] || defaultExpiry;
  }
}

// Export singleton instance
module.exports = new RewardService();
