const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const auth = require("../middlewares/authMiddleware");

// All routes protected
router.use(auth);

// Create payment for order
router.post("/create", paymentController.createPayment);

// Process payment
router.post("/process", paymentController.processPayment);

// Get payment history for user
router.get("/history", paymentController.getPaymentHistory);

// Get payment by ID
router.get("/:id", paymentController.getPaymentById);

// Download invoice
router.get("/:id/invoice", paymentController.downloadInvoice);

// Refund payment (admin only)
router.post("/:id/refund", paymentController.refundPayment);

// Get payment status
router.get("/:id/status", paymentController.getPaymentStatus);

module.exports = router;
