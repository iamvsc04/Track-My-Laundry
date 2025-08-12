const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authMiddleware");
const {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  updateOrderPriority,
  cancelOrder,
  getOrderAnalytics,
  scanNfcTag,
} = require("../controllers/orderController");

// Protected routes - require authentication
router.use(auth);

// Create new order
router.post("/", createOrder);

// Get user's orders with filtering and pagination
router.get("/", getUserOrders);

// Get order analytics
router.get("/analytics", getOrderAnalytics);

// Get specific order by ID
router.get("/:id", getOrderById);

// Update order status
router.patch("/:id/status", updateOrderStatus);

// Update order priority (admin only)
router.patch("/:id/priority", updateOrderPriority);

// Cancel order
router.patch("/:id/cancel", cancelOrder);

// NFC tag scanning
router.post("/scan-nfc", scanNfcTag);

module.exports = router;
