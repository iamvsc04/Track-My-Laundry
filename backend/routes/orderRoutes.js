const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const auth = require("../middlewares/authMiddleware");

// All routes protected
router.use(auth);

// User creates order (NFC-triggered)
router.post("/", orderController.createOrder);

// User gets their orders
router.get("/", orderController.getUserOrders);

// Admin gets all orders
router.get("/all", orderController.getAllOrders);

// Get order by ID (admin or owner)
router.get("/:id", orderController.getOrderById);

// Admin/worker updates order status
router.patch("/:id", orderController.updateOrderStatus);

// Create order with NFC tag (NFC invocation)
router.post("/nfc-invoke", orderController.createOrderWithNfc);

// Mark order as completed and free NFC tag
router.patch("/:id/complete", orderController.completeOrder);

module.exports = router;
