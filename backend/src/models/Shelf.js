const mongoose = require("mongoose");

const stageEnum = ["wash", "iron", "ready"];

const shelfSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    stage: { type: String, enum: stageEnum, required: true },
    isOccupied: { type: Boolean, default: false },
    currentOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Shelf", shelfSchema);
