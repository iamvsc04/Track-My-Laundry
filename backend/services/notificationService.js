const Notification = require('../models/Notification');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const sendSMS = require('../utils/sendSMS');
const { sendPushNotification, sendMultiplePushNotifications } = require('../config/firebase');

class NotificationService {
  constructor() {
    this.emailQueue = [];
    this.smsQueue = [];
    this.pushQueue = [];
  }

  /**
   * Create and send a notification to a user
   * @param {string} userId - User ID
   * @param {Object} notification - Notification data
   * @param {string} notification.title - Notification title
   * @param {string} notification.message - Notification message
   * @param {string} notification.type - Notification type
   * @param {Object} notification.metadata - Additional metadata
   * @param {Object} options - Delivery options
   */
  async createNotification(userId, notification, options = {}) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Create notification in database
      const newNotification = new Notification({
        user: userId,
        title: notification.title,
        message: notification.message,
        type: notification.type || 'system',
        priority: notification.priority || 'medium',
        order: notification.orderId,
        actionUrl: notification.actionUrl,
        actionText: notification.actionText,
        expiresAt: notification.expiresAt,
        metadata: notification.metadata || {},
      });

      await newNotification.save();

      // Send notifications based on user preferences and options
      const deliveryPromises = [];

      // Email notification
      if (
        user.notifications.email &&
        (options.email !== false) &&
        user.emailVerified
      ) {
        deliveryPromises.push(this.sendEmailNotification(user, notification));
      }

      // SMS notification
      if (
        user.notifications.sms &&
        (options.sms !== false) &&
        user.mobileVerified &&
        notification.priority === 'urgent'
      ) {
        deliveryPromises.push(this.sendSMSNotification(user, notification));
      }

      // Push notification
      if (
        user.notifications.push &&
        (options.push !== false) &&
        user.fcmToken
      ) {
        deliveryPromises.push(this.sendPushNotificationToUser(user, notification));
      }

      // Execute all delivery methods
      const results = await Promise.allSettled(deliveryPromises);
      
      // Update notification status based on delivery results
      let emailSent = false;
      let smsSent = false;
      let pushSent = false;

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          if (index === 0) emailSent = true;
          if (index === 1) smsSent = true;
          if (index === 2) pushSent = true;
        }
      });

      // Update notification delivery status
      newNotification.emailSent = emailSent;
      newNotification.smsSent = smsSent;
      newNotification.pushSent = pushSent;
      await newNotification.save();

      return newNotification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Send email notification
   */
  async sendEmailNotification(user, notification) {
    try {
      const subject = notification.title;
      const body = `
Hello ${user.name},

${notification.message}

${notification.actionUrl ? `Take action: ${notification.actionUrl}` : ''}

Best regards,
TrackMyLaundry Team
      `;

      await sendEmail(user.email, body, subject);
      return true;
    } catch (error) {
      console.error('Email notification failed:', error);
      return false;
    }
  }

  /**
   * Send SMS notification
   */
  async sendSMSNotification(user, notification) {
    try {
      const message = `${notification.title}: ${notification.message}`;
      await sendSMS(user.mobile, message);
      return true;
    } catch (error) {
      console.error('SMS notification failed:', error);
      return false;
    }
  }

  /**
   * Send push notification to user
   */
  async sendPushNotificationToUser(user, notification) {
    try {
      if (!user.fcmToken) {
        return false;
      }

      const data = {
        type: notification.type,
        orderId: notification.orderId?.toString() || '',
        actionUrl: notification.actionUrl || '',
      };

      return await sendPushNotification(
        user.fcmToken,
        notification.title,
        notification.message,
        data
      );
    } catch (error) {
      console.error('Push notification failed:', error);
      return false;
    }
  }

  /**
   * Send bulk notifications to multiple users
   */
  async sendBulkNotifications(userIds, notification, options = {}) {
    const results = [];
    
    for (const userId of userIds) {
      try {
        const result = await this.createNotification(userId, notification, options);
        results.push({ userId, success: true, notificationId: result._id });
      } catch (error) {
        results.push({ userId, success: false, error: error.message });
      }
    }

    return results;
  }

  /**
   * Send order status update notification
   */
  async sendOrderStatusNotification(userId, order, newStatus) {
    const statusMessages = {
      'Confirmed': 'Your laundry order has been confirmed and will be picked up soon.',
      'Picked Up': 'Your laundry has been picked up and is on its way to our facility.',
      'Washing': 'Your laundry is currently being washed.',
      'Ironing': 'Your laundry is being ironed and will be ready soon.',
      'Ready for Pickup': 'Great news! Your laundry is ready for pickup.',
      'Out for Delivery': 'Your clean laundry is on its way to you!',
      'Delivered': 'Your laundry has been delivered. Thank you for using TrackMyLaundry!',
      'Cancelled': 'Your order has been cancelled. If you have any questions, please contact us.',
    };

    const notification = {
      title: `Order #${order.orderNumber} - ${newStatus}`,
      message: statusMessages[newStatus] || `Your order status has been updated to ${newStatus}.`,
      type: 'order_update',
      priority: ['Ready for Pickup', 'Out for Delivery', 'Delivered'].includes(newStatus) ? 'high' : 'medium',
      orderId: order._id,
      actionUrl: `/order/${order._id}`,
      actionText: 'View Order',
    };

    return this.createNotification(userId, notification);
  }

  /**
   * Send payment confirmation notification
   */
  async sendPaymentConfirmation(userId, payment, order) {
    const notification = {
      title: 'Payment Confirmed',
      message: `Your payment of ₹${payment.amount} for order #${order.orderNumber} has been processed successfully.`,
      type: 'payment',
      priority: 'high',
      orderId: order._id,
      actionUrl: `/order/${order._id}`,
      actionText: 'View Order',
      metadata: {
        paymentId: payment._id,
        amount: payment.amount,
        transactionId: payment.transactionId,
      },
    };

    return this.createNotification(userId, notification);
  }

  /**
   * Send promotional notification
   */
  async sendPromotionalNotification(userIds, title, message, options = {}) {
    const notification = {
      title,
      message,
      type: 'promo',
      priority: 'low',
      expiresAt: options.expiresAt,
      actionUrl: options.actionUrl,
      actionText: options.actionText,
      metadata: options.metadata,
    };

    return this.sendBulkNotifications(userIds, notification, {
      email: options.sendEmail !== false,
      push: options.sendPush !== false,
      sms: false, // Don't send promotional SMS
    });
  }

  /**
   * Mark notifications as read
   */
  async markAsRead(userId, notificationIds) {
    try {
      await Notification.updateMany(
        { user: userId, _id: { $in: notificationIds } },
        { isRead: true }
      );
      return true;
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      return false;
    }
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(userId) {
    try {
      return await Notification.countDocuments({ user: userId, isRead: false });
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  /**
   * Clean up expired notifications
   */
  async cleanupExpiredNotifications() {
    try {
      const result = await Notification.deleteMany({
        expiresAt: { $lt: new Date() }
      });
      console.log(`Cleaned up ${result.deletedCount} expired notifications`);
      return result.deletedCount;
    } catch (error) {
      console.error('Error cleaning up expired notifications:', error);
      return 0;
    }
  }
}

// Export singleton instance
module.exports = new NotificationService();
