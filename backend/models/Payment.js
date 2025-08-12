const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // Payment Details
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    paymentMethod: {
      type: String,
      enum: [
        "UPI",
        "Credit Card",
        "Debit Card",
        "Net Banking",
        "Wallet",
        "Cash",
      ],
      required: true,
    },

    // Transaction Details
    transactionId: { type: String, required: true, unique: true },
    gatewayTransactionId: { type: String },
    paymentStatus: {
      type: String,
      enum: [
        "Pending",
        "Processing",
        "Completed",
        "Failed",
        "Refunded",
        "Cancelled",
      ],
      default: "Pending",
    },

    // Payment Gateway Response
    gatewayResponse: { type: mongoose.Schema.Types.Mixed },

    // Invoice
    invoiceNumber: { type: String, unique: true },
    invoiceUrl: { type: String },

    // Refund Details
    refundAmount: { type: Number, default: 0 },
    refundReason: { type: String },
    refundedAt: { type: Date },

    // Timestamps
    paidAt: { type: Date },
    failedAt: { type: Date },

    // Notes
    notes: { type: String },
  },
  { timestamps: true }
);

// Generate invoice number before saving
paymentSchema.pre("save", function (next) {
  if (!this.invoiceNumber) {
    this.invoiceNumber =
      "INV" +
      Date.now().toString().slice(-8) +
      Math.random().toString(36).substr(2, 4).toUpperCase();
  }
  next();
});

module.exports = mongoose.model("Payment", paymentSchema);
