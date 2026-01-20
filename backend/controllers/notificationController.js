const Notification = require("../models/Notification");
const User = require("../models/User");

// Get user notifications
exports.getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, type, unreadOnly } = req.query;

    let query = { user: userId };

    if (type) {
      query.type = type;
    }

    if (unreadOnly === "true") {
      query.isRead = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Notification.countDocuments(query);

    res.json({
      data: {
        data: notifications,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        total,
      },
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, user: userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json({
      message: "Notification marked as read",
      notification,
    });
  } catch (error) {
    console.error("Mark as read error:", error);
    res.status(500).json({ message: "Failed to mark notification as read" });
  }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await Notification.updateMany(
      { user: userId, isRead: false },
      { isRead: true }
    );

    res.json({
      message: "All notifications marked as read",
      updatedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Mark all as read error:", error);
    res.status(500).json({ message: "Failed to mark notifications as read" });
  }
};

// Delete notification
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOneAndDelete({
      _id: id,
      user: userId,
    });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json({
      message: "Notification deleted successfully",
      deletedNotification: notification,
    });
  } catch (error) {
    console.error("Delete notification error:", error);
    res.status(500).json({ message: "Failed to delete notification" });
  }
};

// Update notification preferences
exports.updatePreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const { email, sms, push } = req.body;

    const updateData = {};
    if (email !== undefined) updateData["notifications.email"] = email;
    if (sms !== undefined) updateData["notifications.sms"] = sms;
    if (push !== undefined) updateData["notifications.push"] = push;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true }
    ).select("notifications");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "Notification preferences updated",
      preferences: user.notifications,
    });
  } catch (error) {
    console.error("Update preferences error:", error);
    res
      .status(500)
      .json({ message: "Failed to update notification preferences" });
  }
};

// Get unread count
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const count = await Notification.countDocuments({
      user: userId,
      isRead: false,
    });

    res.json({ unreadCount: count });
  } catch (error) {
    console.error("Get unread count error:", error);
    res.status(500).json({ message: "Failed to get unread count" });
  }
};

// Send test notification (for testing)
exports.sendTestNotification = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, message, type = "system" } = req.body;

    const notification = new Notification({
      user: userId,
      title: title || "Test Notification",
      message: message || "This is a test notification",
      type,
      priority: "medium",
    });

    await notification.save();

    res.status(201).json({
      message: "Test notification sent successfully",
      notification,
    });
  } catch (error) {
    console.error("Send test notification error:", error);
    res.status(500).json({ message: "Failed to send test notification" });
  }
};

// Helper function to create notifications (used by other controllers)
exports.createNotification = async (userId, notificationData) => {
  try {
    const notification = new Notification({
      user: userId,
      ...notificationData,
    });

    await notification.save();
    return notification;
  } catch (error) {
    console.error("Create notification error:", error);
    return null;
  }
};

// Helper function to create order status notifications
exports.createOrderStatusNotification = async (
  userId,
  orderId,
  status,
  orderNumber
) => {
  const statusMessages = {
    Pending: "Your order has been placed successfully!",
    Confirmed: "Your order has been confirmed and is being processed.",
    "Picked Up":
      "Your laundry has been picked up and is on its way to our facility.",
    Washing: "Your laundry is being washed with care.",
    Ironing: "Your clothes are being ironed to perfection.",
    "Ready for Pickup": "Your laundry is ready for pickup!",
    "Out for Delivery": "Your laundry is out for delivery.",
    Delivered: "Your laundry has been delivered successfully!",
  };

  const message =
    statusMessages[status] ||
    `Your order ${orderNumber} status has been updated to ${status}.`;

  const getColorForStatus = (status) => {
    const colorMap = {
      'Pending': 'warning',
      'Confirmed': 'info',
      'Picked Up': 'primary',
      'Washing': 'primary',
      'Ironing': 'primary',
      'Ready for Pickup': 'success',
      'Out for Delivery': 'warning',
      'Delivered': 'success',
    };
    return colorMap[status] || 'primary';
  };

  return await this.createNotification(userId, {
    title: `Order Status Update - ${status}`,
    message,
    type: "order",
    color: getColorForStatus(status),
    order: orderId,
    priority:
      status === "Ready for Pickup" || status === "Delivered"
        ? "high"
        : "medium",
    actionUrl: `/orders/${orderId}`,
    actionText: "View Order",
  });
};
