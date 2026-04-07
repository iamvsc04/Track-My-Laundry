const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middlewares/authMiddleware");
const {
  createOrder,
  getUserOrders,
  getOrderById,
  getOrderByNfcTag,
  updateOrderStatus,
  updateOrderPriority,
  cancelOrder,
  getOrderAnalytics,
  scanNfcTag,
} = require("../controllers/orderController");

// Protected routes - require authentication
router.use(protect);

// Create new order
router.post("/", createOrder);

// Get user's orders with filtering and pagination
router.get("/", getUserOrders);

// Get order analytics
router.get("/analytics", getOrderAnalytics);

// Get order by NFC tag (tap-to-open)
router.get("/by-nfc/:nfcTag", getOrderByNfcTag);

// Get specific order by ID
router.get("/:id", getOrderById);

// Update order status (Admin or Owner)
router.patch("/:id/status", updateOrderStatus);

// Update order priority (admin only)
router.patch("/:id/priority", admin, updateOrderPriority);

// Cancel order (Admin or Owner)
router.patch("/:id/cancel", cancelOrder);

// NFC tag scanning
router.post("/scan-nfc", scanNfcTag);

module.exports = router;
