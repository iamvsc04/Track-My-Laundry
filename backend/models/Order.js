const mongoose = require("mongoose");

const statusEnum = ["Yet to Wash", "Washed", "Ironing", "Ready for Pickup"];

const statusLogSchema = new mongoose.Schema(
  {
    status: { type: String, enum: statusEnum, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: statusEnum, default: "Yet to Wash" },
    shelfLocation: { type: String },
    statusLogs: [statusLogSchema],
    nfcTag: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
