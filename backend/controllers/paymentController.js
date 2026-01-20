const Payment = require("../models/Payment");
const Order = require("../models/Order");
const User = require("../models/User");

// Create payment for order
exports.createPayment = async (req, res) => {
  try {
    const { orderId, paymentMethod, amount } = req.body;
    const userId = req.user.id;

    // Verify order exists and belongs to user
    const order = await Order.findOne({ _id: orderId, user: userId });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if payment already exists
    const existingPayment = await Payment.findOne({ order: orderId });
    if (existingPayment) {
      return res
        .status(400)
        .json({ message: "Payment already exists for this order" });
    }

    // Generate transaction ID
    const transactionId =
      "TXN" +
      Date.now().toString().slice(-8) +
      Math.random().toString(36).substr(2, 4).toUpperCase();

    const payment = new Payment({
      order: orderId,
      user: userId,
      amount: amount || order.total,
      paymentMethod,
      transactionId,
      paymentStatus: "Pending",
    });

    await payment.save();

    res.status(201).json({
      message: "Payment created successfully",
      payment: {
        id: payment._id,
        transactionId: payment.transactionId,
        amount: payment.amount,
        status: payment.paymentStatus,
      },
    });
  } catch (error) {
    console.error("Payment creation error:", error);
    res.status(500).json({ message: "Failed to create payment" });
  }
};

// Process payment (simulate payment gateway)
exports.processPayment = async (req, res) => {
  try {
    const { paymentId, paymentDetails } = req.body;
    const userId = req.user.id;

    const payment = await Payment.findOne({ _id: paymentId, user: userId });
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    // Simulate payment processing
    const success = Math.random() > 0.1; // 90% success rate for demo

    if (success) {
      payment.paymentStatus = "Completed";
      payment.paidAt = new Date();
      payment.gatewayResponse = {
        success: true,
        gatewayTransactionId: "GT" + Date.now(),
        ...paymentDetails,
      };

      await payment.save();

      // Update order payment status
      await Order.findByIdAndUpdate(payment.order, {
        paymentStatus: "Paid",
        paymentMethod: payment.paymentMethod,
        transactionId: payment.transactionId,
      });

      res.json({
        message: "Payment processed successfully",
        payment: {
          id: payment._id,
          status: payment.paymentStatus,
          transactionId: payment.transactionId,
        },
      });
    } else {
      payment.paymentStatus = "Failed";
      payment.failedAt = new Date();
      payment.gatewayResponse = {
        success: false,
        error: "Payment gateway error",
        ...paymentDetails,
      };

      await payment.save();

      res.status(400).json({
        message: "Payment failed",
        payment: {
          id: payment._id,
          status: payment.paymentStatus,
        },
      });
    }
  } catch (error) {
    console.error("Payment processing error:", error);
    res.status(500).json({ message: "Failed to process payment" });
  }
};

// Get payment history for user
exports.getPaymentHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const payments = await Payment.find({ user: userId })
      .populate("order", "orderNumber status total")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Payment.countDocuments({ user: userId });

    res.json({
      payments,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    console.error("Payment history error:", error);
    res.status(500).json({ message: "Failed to fetch payment history" });
  }
};

// Get payment by ID
exports.getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const payment = await Payment.findOne({ _id: id, user: userId }).populate(
      "order",
      "orderNumber status total items"
    );

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    res.json({ payment });
  } catch (error) {
    console.error("Get payment error:", error);
    res.status(500).json({ message: "Failed to fetch payment" });
  }
};

// Download invoice
exports.downloadInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { format = 'pdf' } = req.query;

    const payment = await Payment.findOne({ _id: id, user: userId })
      .populate("order", "orderNumber items total subtotal tax discount serviceType pickup delivery")
      .populate("user", "name email mobile");

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    const invoiceData = {
      invoiceNumber: payment.invoiceNumber,
      date: payment.createdAt,
      customer: {
        name: payment.user.name,
        email: payment.user.email,
        mobile: payment.user.mobile,
      },
      order: {
        number: payment.order.orderNumber,
        items: payment.order.items,
        total: payment.order.total,
        subtotal: payment.order.subtotal,
        tax: payment.order.tax,
        discount: payment.order.discount,
        serviceType: payment.order.serviceType,
        pickup: payment.order.pickup,
        delivery: payment.order.delivery,
        status: payment.order.status || 'Delivered',
      },
      payment: {
        method: payment.paymentMethod,
        transactionId: payment.transactionId,
        amount: payment.amount,
        status: payment.paymentStatus,
      },
    };

    if (format === 'pdf') {
      const invoiceService = require('../services/invoiceService');
      const pdf = await invoiceService.generateInvoicePDF(invoiceData);
      
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${payment.invoiceNumber}.pdf"`,
        'Content-Length': pdf.length,
      });
      
      res.send(pdf);
    } else {
      // Return JSON format for backward compatibility
      res.json({
        message: "Invoice data retrieved successfully",
        invoice: invoiceData,
      });
    }
  } catch (error) {
    console.error("Invoice download error:", error);
    res.status(500).json({ message: "Failed to download invoice" });
  }
};

// Refund payment (admin only)
exports.refundPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, amount } = req.body;

    // Check if user is admin
    if (req.user.role !== "admin" && req.user.role !== "super-admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const payment = await Payment.findById(id);
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    if (payment.paymentStatus !== "Completed") {
      return res
        .status(400)
        .json({ message: "Only completed payments can be refunded" });
    }

    payment.paymentStatus = "Refunded";
    payment.refundAmount = amount || payment.amount;
    payment.refundReason = reason;
    payment.refundedAt = new Date();

    await payment.save();

    res.json({
      message: "Payment refunded successfully",
      payment: {
        id: payment._id,
        status: payment.paymentStatus,
        refundAmount: payment.refundAmount,
      },
    });
  } catch (error) {
    console.error("Payment refund error:", error);
    res.status(500).json({ message: "Failed to refund payment" });
  }
};

// Get payment status
exports.getPaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const payment = await Payment.findOne({ _id: id, user: userId }).select(
      "paymentStatus amount transactionId"
    );

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    res.json({
      status: payment.paymentStatus,
      amount: payment.amount,
      transactionId: payment.transactionId,
    });
  } catch (error) {
    console.error("Payment status error:", error);
    res.status(500).json({ message: "Failed to get payment status" });
  }
};
