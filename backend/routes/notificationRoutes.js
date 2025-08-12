const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const auth = require("../middlewares/authMiddleware");

// All routes protected
router.use(auth);

// Get user notifications
router.get("/", notificationController.getUserNotifications);

// Mark notification as read
router.patch("/:id/read", notificationController.markAsRead);

// Mark all notifications as read
router.patch("/read-all", notificationController.markAllAsRead);

// Delete notification
router.delete("/:id", notificationController.deleteNotification);

// Update notification preferences
router.patch("/preferences", notificationController.updatePreferences);

// Get unread count
router.get("/unread-count", notificationController.getUnreadCount);

// Send test notification (for testing)
router.post("/test", notificationController.sendTestNotification);

module.exports = router;
