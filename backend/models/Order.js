const mongoose = require("mongoose");

const statusEnum = [
  "Pending",
  "Confirmed",
  "Picked Up",
  "Washing",
  "Ironing",
  "Ready for Pickup",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
];

const statusLogSchema = new mongoose.Schema(
  {
    status: { type: String, enum: statusEnum, required: true },
    timestamp: { type: Date, default: Date.now },
    note: { type: String },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    location: { type: String }, // Add location tracking
    estimatedTime: { type: Date }, // Add estimated completion time
    staffNotes: { type: String }, // Add staff notes
  },
  { _id: false }
);

const itemSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        "Shirt",
        "Pants",
        "Dress",
        "Suit",
        "Bedsheet",
        "Towel",
        "Curtain",
        "Other",
      ],
      required: true,
    },
    quantity: { type: Number, required: true, min: 1 },
    service: {
      type: String,
      enum: ["Wash & Fold", "Dry Clean", "Iron Only", "Premium Wash"],
      required: true,
    },
    specialInstructions: { type: String },
    price: { type: Number, required: true },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    orderNumber: { type: String, required: true, unique: true },
    status: { type: String, enum: statusEnum, default: "Pending" },

    // Order Details
    serviceType: {
      type: String,
      enum: ["Wash & Fold", "Dry Clean", "Iron Only", "Premium Wash"],
      required: true,
    },
    items: [itemSchema],

    // Pickup & Delivery
    pickup: {
      address: { type: String, required: true },
      date: { type: Date, required: true },
      timeSlot: { type: String, required: true },
      instructions: { type: String },
    },
    delivery: {
      address: { type: String, required: true },
      date: { type: Date, required: true },
      timeSlot: { type: String, required: true },
      instructions: { type: String },
    },

    // Pricing
    subtotal: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },

    // Payment
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed", "Refunded"],
      default: "Pending",
    },
    paymentMethod: { type: String },
    transactionId: { type: String },

    // NFC & Tracking
    nfcTag: { type: String, required: true, unique: true },
    shelfLocation: { type: String },
    trackingCode: { type: String, unique: true },
    currentLocation: { type: String, default: "Facility" }, // Add current location tracking

    // Staff & Processing
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    estimatedCompletion: { type: Date },
    actualCompletion: { type: Date }, // Add actual completion time

    // Customer Preferences
    customerPreferences: {
      detergentType: { type: String },
      fabricSoftener: { type: Boolean },
      starchLevel: { type: String },
      ironing: { type: Boolean },
    },

    // Status History
    statusLogs: [statusLogSchema],

    // Notes
    customerNotes: { type: String },
    staffNotes: { type: String },

    // Real-time tracking
    lastUpdated: { type: Date, default: Date.now },
    isUrgent: { type: Boolean, default: false }, // Add urgent order flag
    priority: {
      type: String,
      enum: ["Low", "Normal", "High", "Urgent"],
      default: "Normal",
    },
  },
  { timestamps: true }
);

// Generate order number before saving
orderSchema.pre("save", function (next) {
  if (!this.orderNumber) {
    this.orderNumber =
      "LAU" +
      Date.now().toString().slice(-8) +
      Math.random().toString(36).substr(2, 4).toUpperCase();
  }
  if (!this.trackingCode) {
    this.trackingCode =
      "TRK" +
      Date.now().toString().slice(-8) +
      Math.random().toString(36).substr(2, 4).toUpperCase();
  }
  next();
});

module.exports = mongoose.model("Order", orderSchema);
