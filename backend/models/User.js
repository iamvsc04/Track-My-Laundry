const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    mobile: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["user", "admin", "super-admin"],
      default: "user",
    },
    emailVerified: { type: Boolean, default: false },
    mobileVerified: { type: Boolean, default: false },
    emailOTP: { type: String },
    mobileOTP: { type: String },

    // Profile Information
    profile: {
      avatar: { type: String },
      address: {
        street: { type: String },
        city: { type: String },
        state: { type: String },
        pincode: { type: String },
        landmark: { type: String },
      },
      preferences: {
        detergentType: {
          type: String,
          enum: ["Regular", "Eco-friendly", "Sensitive Skin", "Premium"],
          default: "Regular",
        },
        fabricSoftener: { type: Boolean, default: true },
        starchLevel: {
          type: String,
          enum: ["None", "Light", "Medium", "Heavy"],
          default: "None",
        },
        ironing: { type: Boolean, default: true },
      },
    },

    // Payment Methods
    paymentMethods: [
      {
        type: { type: String, enum: ["UPI", "Card", "Wallet"] },
        details: { type: mongoose.Schema.Types.Mixed },
        isDefault: { type: Boolean, default: false },
      },
    ],

    // Notification Preferences
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      orderUpdates: { type: Boolean, default: true },
      paymentReminders: { type: Boolean, default: true },
      promotionalOffers: { type: Boolean, default: false },
      deliveryNotifications: { type: Boolean, default: true },
      promotions: { type: Boolean, default: false },
      rewards: { type: Boolean, default: true },
      reminders: { type: Boolean, default: true },
    },

    // Theme Preference
    theme: { type: String, enum: ["light", "dark"], default: "light" },

    // FCM Token for push notifications
    fcmToken: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
