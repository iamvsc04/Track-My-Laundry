const mongoose = require("mongoose");

const verificationSchema = new mongoose.Schema(
  {
    contactType: { type: String, enum: ["email", "mobile"], required: true },
    contactValue: { type: String, required: true, index: true },
    otp: { type: String, required: true },
    verified: { type: Boolean, default: false },
    expiresAt: { type: Date, required: true },
    purpose: {
      type: String,
      enum: ["register", "login", "reset"],
      default: "register",
    },
  },
  { timestamps: true }
);

verificationSchema.index(
  { contactType: 1, contactValue: 1, purpose: 1 },
  { unique: true }
);

module.exports = mongoose.model("Verification", verificationSchema);
