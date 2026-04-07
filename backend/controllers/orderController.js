const Order = require("../models/Order");
const User = require("../models/User");
const Notification = require("../models/Notification");
const rewardService = require("../services/rewardService");
const notificationService = require("../services/notificationService");

const getAdminUserIds = async () => {
  const admins = await User.find({ role: { $in: ["admin", "super-admin"] } }).select("_id");
  return admins.map((adminUser) => adminUser._id);
};

const createAdminOrderNotifications = async ({
  title,
  message,
  order,
  priority = "medium",
  metadata = {},
}) => {
  try {
    const adminUserIds = await getAdminUserIds();
    if (adminUserIds.length === 0) return;

    await Notification.insertMany(
      adminUserIds.map((adminUserId) => ({
        user: adminUserId,
        title,
        message,
        type: "order_update",
        color: priority === "high" ? "warning" : "info",
        priority,
        order: order._id,
        actionUrl: `/order/${order._id}`,
        actionText: "View Order",
        metadata,
      }))
    );
  } catch (error) {
    console.error("Error creating admin order notifications:", error);
  }
};

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
      userId,
      nfcTag: requestedNfcTag,
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

    const isAdminUser =
      req.user.role === "admin" || req.user.role === "super-admin";

    if (isAdminUser && !userId) {
      return res.status(400).json({
        success: false,
        message: "Customer is required when an admin creates an order",
      });
    }

    const orderUserId = isAdminUser ? userId : req.user.id;

    if (userId && orderUserId !== req.user.id) {
      const orderUser = await User.findById(orderUserId);
      if (!orderUser) {
        return res.status(404).json({
          success: false,
          message: "Selected customer was not found",
        });
      }
    }

    // Generate or reuse NFC tag from a scanned sticker
    const nfcTag =
      requestedNfcTag ||
      `NFC_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

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
      user: orderUserId,
      orderNumber,
      trackingCode,
      serviceType,
      items,
      pickup,
      delivery,
      estimatedCompletion: delivery?.date,
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
      user: orderUserId,
      title: "Order Created Successfully",
      message: `Your order #${order.orderNumber} has been created and is pending confirmation.`,
      type: "order",
      color: "success",
      priority: "high",
      order: order._id,
      actionUrl: `/order/${order._id}`,
      actionText: "View Order",
    });

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: order,
    });

    setImmediate(() => {
      createAdminOrderNotifications({
        title: "New Order Created",
        message: `Order #${order.orderNumber} was created and is pending confirmation.`,
        order,
        priority: "high",
        metadata: {
          event: "order_created",
          createdBy: req.user.id,
          customerId: orderUserId,
        },
      });
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

    if (error.code === 11000 && error.keyPattern?.nfcTag) {
      return res.status(409).json({
        success: false,
        message: "This NFC tag is already linked to another order",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create order",
      error: error.message,
    });
  }
};

// Get all orders for a user (or all orders for admin)
const getUserOrders = async (req, res) => {
  try {
    const {
      status,
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
      userId, // Optional filter for admin
    } = req.query;

    let query = {};
    
    // If not admin, restrict to own orders
    if (req.user.role !== "admin" && req.user.role !== "super-admin") {
      query.user = req.user.id;
    } else if (userId) {
      // Admin can filter by specific user
      query.user = userId;
    }

    if (status && status !== "all") {
      query.status = status;
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

    const orders = await Order.find(query)
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate("user", "name email mobile")
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
    console.error("Error fetching orders:", error);
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
      .populate("user", "name email mobile profile")
      .populate("assignedTo", "name email")
      .populate("statusLogs.updatedBy", "name");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check if user owns the order or is admin/super-admin
    if (
      order.user._id.toString() !== req.user.id &&
      req.user.role !== "admin" &&
      req.user.role !== "super-admin"
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

    // Check if user can update this order (Owner, Admin, or Super Admin)
    if (
      order.user.toString() !== req.user.id && 
      req.user.role !== "admin" &&
      req.user.role !== "super-admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const previousStatus = order.status;

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

    const newlyDelivered = status === "Delivered" && previousStatus !== "Delivered";

    // Set actual completion time if status is delivered
    if (newlyDelivered) {
      order.actualCompletion = new Date();
    }

    await order.save();

    const populatedOrder = await Order.findById(order._id)
      .populate("user", "name email mobile profile")
      .populate("assignedTo", "name email mobile")
      .populate("statusLogs.updatedBy", "name email");

    res.json({
      success: true,
      message: "Order status updated successfully",
      data: populatedOrder,
    });

    setImmediate(async () => {
      if (newlyDelivered) {
        try {
          await rewardService.processOrderCompletion(order);
        } catch (error) {
          console.error("Error processing order completion rewards:", error);
        }
      }

      await createAdminOrderNotifications({
        title: `Order #${order.orderNumber} Updated`,
        message: `Status changed to ${status}${note ? `: ${note}` : "."}`,
        order,
        priority: ["Ready for Pickup", "Out for Delivery", "Delivered"].includes(status)
          ? "high"
          : "medium",
        metadata: {
          event: "order_status_updated",
          status,
          updatedBy: req.user.id,
        },
      });

      // Send notification after the response so slow email/SMS/push providers
      // do not block the order status update request.
      try {
        await notificationService.sendOrderStatusNotification(
          order.user,
          order,
          status,
        );
      } catch (error) {
        console.error("Error sending order status notification:", error);
        try {
          await Notification.create({
            user: order.user,
            title: `Order Status Updated`,
            message: `Your order #${order.orderNumber} status has been updated to ${status}.`,
            type: "status_update",
            order: order._id,
          });
        } catch (fallbackError) {
          console.error("Error creating fallback status notification:", fallbackError);
        }
      }
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

    // Only admins or super-admins can update priority
    if (req.user.role !== "admin" && req.user.role !== "super-admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only administrators can update priority.",
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

    // Check if user owns the order or is admin/super-admin
    if (
      order.user.toString() !== req.user.id && 
      req.user.role !== "admin" &&
      req.user.role !== "super-admin"
    ) {
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
        color: "error",
        priority: "high",
        order: order._id,
        actionUrl: `/order/${order._id}`,
        actionText: "View Order",
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

// Get order analytics for user (or system-wide for admin)
const getOrderAnalytics = async (req, res) => {
  try {
    const { period = "30" } = req.query; // days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    const matchQuery = {
      createdAt: { $gte: startDate },
    };

    // If not admin, restrict to own analytics
    if (req.user.role !== "admin" && req.user.role !== "super-admin") {
      matchQuery.user = req.user.id;
    }

    const analytics = await Order.aggregate([
      {
        $match: matchQuery,
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$total" },
        },
      },
    ]);

    let totalOrdersCountQuery = {};
    if (req.user.role !== "admin" && req.user.role !== "super-admin") {
      totalOrdersCountQuery.user = req.user.id;
    }
    const totalOrders = await Order.countDocuments(totalOrdersCountQuery);

    const totalSpentMatch = {};
    if (req.user.role !== "admin" && req.user.role !== "super-admin") {
      totalSpentMatch.user = req.user.id;
    }
    const totalSpent = await Order.aggregate([
      { $match: totalSpentMatch },
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

// NFC tag scanning endpoint - used for status updates, verification, and assignment
const scanNfcTag = async (req, res) => {
  try {
    const { nfcTag, operation = "status_update", newStatus, location, note, orderId } = req.body;

    if (!nfcTag) {
      return res.status(400).json({ success: false, message: "NFC Tag ID is required" });
    }

    let order;
    if (operation === "assign") {
      // Assign existing order ID to a new NFC tag
      if (!orderId) {
        return res.status(400).json({ success: false, message: "Order ID is required for assignment" });
      }
      order = await Order.findById(orderId);
      if (!order) return res.status(404).json({ success: false, message: "Order not found" });
      
      order.nfcTag = nfcTag;
      await order.save();
      
      return res.json({
        success: true,
        message: "NFC Tag assigned to order successfully",
        data: { orderId: order._id, orderNumber: order.orderNumber, nfcTag: order.nfcTag }
      });
    }

    // Default: find order by NFC tag
    order = await Order.findOne({ nfcTag }).populate("user", "name email mobile");
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "No order associated with this NFC tag",
      });
    }

    // Verification operation
    if (operation === "verify") {
      return res.json({
        success: true,
        message: "NFC tag verified",
        data: {
          orderId: order._id,
          orderNumber: order.orderNumber,
          currentStatus: order.status,
          customerName: order.user?.name || "Unknown",
        },
      });
    }

    // Update order status if newStatus provided or operation is status_update
    if (newStatus || operation === "status_update") {
      const statusToApply = newStatus || order.status; // Default to current if only logging location
      
      order.status = statusToApply;
      order.currentLocation = location || order.currentLocation;
      order.lastUpdated = new Date();

      order.statusLogs.push({
        status: statusToApply,
        note:
          note ||
          `Status updated via NFC scan at ${location || "Facility"}`,
        updatedBy: req.user.id,
        location,
        timestamp: new Date(),
      });

      await order.save();

      // Create notification
      await Notification.create({
        user: order.user,
        title: "Order Status Updated",
        message: `Your order #${order.orderNumber} has been updated to ${statusToApply}.`,
        type: "status_update",
        color: "info",
        order: order._id,
        actionUrl: `/order/${order._id}`,
        actionText: "View Order",
      });
    }

    res.json({
      success: true,
      message: "NFC tag processed successfully",
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        currentStatus: order.status,
        customerName: order.user?.name || "Unknown",
      },
    });
  } catch (error) {
    console.error("Error scanning NFC tag:", error);
    if (error.code === 11000 && error.keyPattern?.nfcTag) {
      return res.status(409).json({
        success: false,
        message: "This NFC tag is already linked to another order",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to scan NFC tag",
      error: error.message,
    });
  }
};

// Get order by NFC tag (for tap-to-open flows)
const getOrderByNfcTag = async (req, res) => {
  try {
    const { nfcTag } = req.params;

    if (!nfcTag) {
      return res
        .status(400)
        .json({ success: false, message: "NFC Tag ID is required" });
    }

    const order = await Order.findOne({ nfcTag })
      .populate("user", "name email mobile role")
      .populate("assignedTo", "name email")
      .exec();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "No order associated with this NFC tag",
      });
    }

    const isAdminUser =
      req.user.role === "admin" || req.user.role === "super-admin";
    const isOwner = order.user?._id?.toString() === req.user.id;

    if (!isAdminUser && !isOwner) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to view this order",
      });
    }

    return res.json({
      success: true,
      message: "Order found",
      data: order,
    });
  } catch (error) {
    console.error("Error fetching order by NFC tag:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch order by NFC tag",
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
  getOrderByNfcTag,
};
