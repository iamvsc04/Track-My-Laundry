const mongoose = require('mongoose');

// Individual reward/achievement schema
const rewardSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    
    // Reward Details
    type: {
      type: String,
      enum: [
        'points',
        'streak_bonus',
        'referral_bonus',
        'first_order',
        'loyalty_milestone',
        'seasonal_bonus',
        'review_reward',
        'eco_warrior'
      ],
      required: true,
    },
    
    title: { type: String, required: true },
    description: { type: String, required: true },
    
    // Points and Values
    points: { type: Number, default: 0 },
    cashValue: { type: Number, default: 0 }, // Points to cash conversion
    
    // Reward Metadata
    source: {
      orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
      referralId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      achievementId: { type: String },
      metadata: { type: mongoose.Schema.Types.Mixed },
    },
    
    // Status
    status: {
      type: String,
      enum: ['pending', 'active', 'redeemed', 'expired'],
      default: 'active',
    },
    
    // Expiry
    expiresAt: { type: Date },
    redeemedAt: { type: Date },
    
    // Multiplier for special events
    multiplier: { type: Number, default: 1 },
  },
  { timestamps: true }
);

// User loyalty profile schema
const loyaltyProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    
    // Points System
    totalPointsEarned: { type: Number, default: 0 },
    availablePoints: { type: Number, default: 0 },
    redeemedPoints: { type: Number, default: 0 },
    
    // Level System
    currentLevel: { type: Number, default: 1 },
    levelName: { type: String, default: 'Bronze' },
    pointsToNextLevel: { type: Number, default: 1000 },
    
    // Streaks
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastOrderDate: { type: Date },
    
    // Referrals
    referralCode: { type: String, unique: true },
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    referralsCount: { type: Number, default: 0 },
    referralPointsEarned: { type: Number, default: 0 },
    
    // Achievements
    achievements: [{
      id: { type: String, required: true },
      name: { type: String, required: true },
      description: { type: String },
      unlockedAt: { type: Date, default: Date.now },
      points: { type: Number, default: 0 },
      icon: { type: String },
      rarity: { type: String, enum: ['common', 'rare', 'epic', 'legendary'], default: 'common' },
    }],
    
    // Statistics for achievements
    stats: {
      totalOrders: { type: Number, default: 0 },
      totalSpent: { type: Number, default: 0 },
      favoriteMaterial: { type: String },
      averageRating: { type: Number, default: 0 },
      reviewsCount: { type: Number, default: 0 },
      ecoFriendlyChoices: { type: Number, default: 0 },
      urgentOrders: { type: Number, default: 0 },
      cancelledOrders: { type: Number, default: 0 },
    },
    
    // Preferences
    preferences: {
      emailNotifications: { type: Boolean, default: true },
      pushNotifications: { type: Boolean, default: true },
      levelUpNotifications: { type: Boolean, default: true },
      achievementNotifications: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

// Generate referral code before saving
loyaltyProfileSchema.pre('save', function(next) {
  if (!this.referralCode) {
    this.referralCode = 'REF' + Date.now().toString(36).toUpperCase() + 
      Math.random().toString(36).substr(2, 4).toUpperCase();
  }
  next();
});

// Calculate level based on points
loyaltyProfileSchema.methods.calculateLevel = function() {
  const levels = [
    { level: 1, name: 'Bronze', minPoints: 0, maxPoints: 999 },
    { level: 2, name: 'Silver', minPoints: 1000, maxPoints: 2999 },
    { level: 3, name: 'Gold', minPoints: 3000, maxPoints: 6999 },
    { level: 4, name: 'Platinum', minPoints: 7000, maxPoints: 14999 },
    { level: 5, name: 'Diamond', minPoints: 15000, maxPoints: 29999 },
    { level: 6, name: 'Elite', minPoints: 30000, maxPoints: Infinity },
  ];
  
  const currentLevelData = levels.find(l => 
    this.totalPointsEarned >= l.minPoints && 
    this.totalPointsEarned <= l.maxPoints
  );
  
  if (currentLevelData) {
    this.currentLevel = currentLevelData.level;
    this.levelName = currentLevelData.name;
    
    const nextLevel = levels.find(l => l.level === currentLevelData.level + 1);
    if (nextLevel) {
      this.pointsToNextLevel = nextLevel.minPoints - this.totalPointsEarned;
    } else {
      this.pointsToNextLevel = 0; // Max level reached
    }
  }
  
  return currentLevelData;
};

// Add achievement method
loyaltyProfileSchema.methods.addAchievement = function(achievementData) {
  const existingAchievement = this.achievements.find(a => a.id === achievementData.id);
  if (!existingAchievement) {
    this.achievements.push(achievementData);
    return true;
  }
  return false; // Achievement already exists
};

// Redemption history schema
const redemptionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    
    // Redemption Details
    type: {
      type: String,
      enum: ['discount', 'free_service', 'cash_credit', 'gift_item'],
      required: true,
    },
    
    title: { type: String, required: true },
    description: { type: String, required: true },
    
    // Cost and Value
    pointsCost: { type: Number, required: true },
    cashValue: { type: Number, required: true },
    discountPercentage: { type: Number },
    
    // Application
    appliedToOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    couponCode: { type: String },
    
    // Status
    status: {
      type: String,
      enum: ['pending', 'applied', 'used', 'expired', 'cancelled'],
      default: 'pending',
    },
    
    // Validity
    validFrom: { type: Date, default: Date.now },
    validUntil: { type: Date },
    usedAt: { type: Date },
  },
  { timestamps: true }
);

// Index for efficient queries
rewardSchema.index({ user: 1, createdAt: -1 });
rewardSchema.index({ user: 1, status: 1 });
loyaltyProfileSchema.index({ user: 1 });
loyaltyProfileSchema.index({ referralCode: 1 });
redemptionSchema.index({ user: 1, status: 1 });

module.exports = {
  Reward: mongoose.model('Reward', rewardSchema),
  LoyaltyProfile: mongoose.model('LoyaltyProfile', loyaltyProfileSchema),
  Redemption: mongoose.model('Redemption', redemptionSchema),
};
