const Order = require("../models/Order");
const User = require("../models/User");
const Notification = require("../models/Notification");
const rewardService = require("../services/rewardService");
const notificationService = require("../services/notificationService");

// Create new order
const createOrder = async (req, res) => {
  try {
    const {
      serviceType,
      items,
      pickup,
      delivery,
      customerPreferences,
      customerNotes,
      isUrgent,
      priority,
    } = req.body;

    // Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Order must contain at least one item",
      });
    }

    // Validate schema required fields (prevent 500 mongoose validation errors)
    if (!serviceType) {
      return res
        .status(400)
        .json({ success: false, message: "Service Type is required" });
    }
    if (!pickup?.address || !pickup?.date || !pickup?.timeSlot) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Complete pickup details are required",
        });
    }
    if (!delivery?.address || !delivery?.date || !delivery?.timeSlot) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Complete delivery details are required",
        });
    }

    // Calculate pricing - account for quantities and potential discounts
    const subtotal = items.reduce(
      (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
      0,
    );
    const tax = Math.round(subtotal * 0.1 * 100) / 100; // 10% tax, rounded to 2 decimals
    const total = Math.round((subtotal + tax ) * 100) / 100;

    // Generate NFC tag
    const nfcTag = `NFC_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // Generate Order Number and Tracking Code explicitly
    const orderNumber =
      "LAU" +
      Date.now().toString().slice(-8) +
      Math.random().toString(36).substr(2, 4).toUpperCase();
    const trackingCode =
      "TRK" +
      Date.now().toString().slice(-8) +
      Math.random().toString(36).substr(2, 4).toUpperCase();

    const order = new Order({
      user: req.user.id,
      orderNumber,
      trackingCode,
      serviceType,
      items,
      pickup,
      delivery,
      subtotal,
      tax,
      total,
      customerPreferences,
      customerNotes,
      nfcTag,
      isUrgent: isUrgent || false,
      priority: priority || "Normal",
      statusLogs: [
        {
          status: "Pending",
          note: "Order created",
          updatedBy: req.user.id,
          timestamp: new Date(),
        },
      ],
    });

    await order.save();

    // Create notification for user
    await Notification.create({
      user: req.user.id,
      title: "Order Created Successfully",
      message: `Your order #${order.orderNumber} has been created and is pending confirmation.`,
      type: "order",
      order: order._id,
    });

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: order,
    });
  } catch (error) {
    console.error("Error creating order (Detailed):", error);

    // Return validation errors clearly
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: messages,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create order",
      error: error.message,
    });
  }
};

// Get all orders for a user
const getUserOrders = async (req, res) => {
  try {
    const {
      status,
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const query = { user: req.user.id };
    if (status && status !== "all") {
      query.status = status;
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

    const orders = await Order.find(query)
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate("assignedTo", "name email")
      .exec();

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      data: orders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalOrders: total,
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
};

// Get order by ID
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email phone")
      .populate("assignedTo", "name email")
      .populate("statusLogs.updatedBy", "name");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check if user owns the order or is admin
    if (
      order.user._id.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch order",
      error: error.message,
    });
  }
};

// Update order status
const updateOrderStatus = async (req, res) => {
  try {
    const { status, note, location, estimatedTime, staffNotes } = req.body;
    const { id } = req.params;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check if user can update this order
    if (order.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // Add status log
    const statusLog = {
      status,
      note,
      location,
      estimatedTime,
      staffNotes,
      updatedBy: req.user.id,
      timestamp: new Date(),
    };

    order.status = status;
    order.statusLogs.push(statusLog);
    order.lastUpdated = new Date();

    // Update estimated completion if provided
    if (estimatedTime) {
      order.estimatedCompletion = estimatedTime;
    }

    // Update current location if provided
    if (location) {
      order.currentLocation = location;
    }

    // Set actual completion time if status is delivered
    if (status === "Delivered") {
      order.actualCompletion = new Date();

      // Process rewards for order completion
      try {
        await rewardService.processOrderCompletion(order);
      } catch (error) {
        console.error("Error processing order completion rewards:", error);
      }
    }

    await order.save();

    // Send notification for status change using notification service
    try {
      await notificationService.sendOrderStatusNotification(
        order.user,
        order,
        status,
      );
    } catch (error) {
      console.error("Error sending order status notification:", error);
      // Fallback to old notification method
      await Notification.create({
        user: order.user,
        title: `Order Status Updated`,
        message: `Your order #${order.orderNumber} status has been updated to ${status}.`,
        type: "status_update",
        order: order._id,
      });
    }

    res.json({
      success: true,
      message: "Order status updated successfully",
      data: order,
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update order status",
      error: error.message,
    });
  }
};

// Update order priority
const updateOrderPriority = async (req, res) => {
  try {
    const { priority, isUrgent } = req.body;
    const { id } = req.params;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Only admins can update priority
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only admins can update priority.",
      });
    }

    order.priority = priority;
    order.isUrgent = isUrgent || false;
    order.lastUpdated = new Date();

    await order.save();

    res.json({
      success: true,
      message: "Order priority updated successfully",
      data: order,
    });
  } catch (error) {
    console.error("Error updating order priority:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update order priority",
      error: error.message,
    });
  }
};

// Cancel order
const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check if order can be cancelled
    if (!["Pending", "Confirmed"].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: "Order cannot be cancelled at this stage",
      });
    }

    // Check if user owns the order or is admin
    if (order.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    order.status = "Cancelled";
    order.statusLogs.push({
      status: "Cancelled",
      note: `Order cancelled${reason ? `: ${reason}` : ""}`,
      updatedBy: req.user.id,
      timestamp: new Date(),
    });

    await order.save();

    // Create notification
    await Notification.create({
      user: order.user,
      title: "Order Cancelled",
      message: `Your order #${order.orderNumber} has been cancelled.`,
      type: "status_update",
      order: order._id,
    });

    res.json({
      success: true,
      message: "Order cancelled successfully",
      data: order,
    });
  } catch (error) {
    console.error("Error cancelling order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to cancel order",
      error: error.message,
    });
  }
};

// Get order analytics for user
const getOrderAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = "30" } = req.query; // days

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    const analytics = await Order.aggregate([
      {
        $match: {
          user: userId,
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$total" },
        },
      },
    ]);

    const totalOrders = await Order.countDocuments({ user: userId });
    const totalSpent = await Order.aggregate([
      { $match: { user: userId } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]);

    res.json({
      success: true,
      data: {
        analytics,
        totalOrders,
        totalSpent: totalSpent[0]?.total || 0,
        period,
      },
    });
  } catch (error) {
    console.error("Error fetching order analytics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch analytics",
      error: error.message,
    });
  }
};

// NFC tag scanning endpoint
const scanNfcTag = async (req, res) => {
  try {
    const { nfcTag, newStatus, location, note } = req.body;

    const order = await Order.findOne({ nfcTag });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found for this NFC tag",
      });
    }

    // Update order status
    if (newStatus) {
      order.status = newStatus;
      order.currentLocation = location || order.currentLocation;
      order.lastUpdated = new Date();

      order.statusLogs.push({
        status: newStatus,
        note:
          note ||
          `Status updated via NFC scan at ${location || "unknown location"}`,
        updatedBy: req.user.id,
        location,
        timestamp: new Date(),
      });

      await order.save();

      // Create notification
      await Notification.create({
        user: order.user,
        title: "Order Status Updated",
        message: `Your order #${order.orderNumber} has been updated to ${newStatus}.`,
        type: "status_update",
        order: order._id,
      });
    }

    res.json({
      success: true,
      message: "NFC tag scanned successfully",
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        currentStatus: order.status,
        customerName: order.user,
      },
    });
  } catch (error) {
    console.error("Error scanning NFC tag:", error);
    res.status(500).json({
      success: false,
      message: "Failed to scan NFC tag",
      error: error.message,
    });
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  updateOrderPriority,
  cancelOrder,
  getOrderAnalytics,
  scanNfcTag,
};
