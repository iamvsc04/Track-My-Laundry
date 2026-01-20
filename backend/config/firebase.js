const admin = require("firebase-admin");

let firebaseApp = null;

const initializeFirebase = () => {
  if (firebaseApp) return firebaseApp;

  try {
    // Check if Firebase is configured via service account key
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      const serviceAccount = JSON.parse(
        process.env.FIREBASE_SERVICE_ACCOUNT_KEY
      );
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID,
      });
    } else if (process.env.FIREBASE_PROJECT_ID) {
      // Use default credentials (for deployment on Google Cloud)
      firebaseApp = admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID,
      });
    } else {
      console.log(
        "Firebase not configured. Push notifications will be disabled."
      );
      return null;
    }

    console.log("Firebase initialized successfully");
    return firebaseApp;
  } catch (error) {
    console.error("Failed to initialize Firebase:", error.message);
    return null;
  }
};

const getFirebaseApp = () => {
  return firebaseApp || initializeFirebase();
};

const sendPushNotification = async (fcmToken, title, body, data = {}) => {
  const app = getFirebaseApp();
  if (!app) {
    console.log("Firebase not available, skipping push notification");
    return false;
  }

  try {
    const message = {
      notification: {
        title,
        body,
      },
      data: {
        ...data,
        timestamp: new Date().toISOString(),
      },
      token: fcmToken,
      android: {
        notification: {
          icon: "ic_notification",
          color: "#6b7cff",
          sound: "default",
        },
      },
      apns: {
        payload: {
          aps: {
            sound: "default",
            badge: 1,
          },
        },
      },
    };

    const response = await admin.messaging().send(message);
    console.log("Push notification sent successfully:", response);
    return true;
  } catch (error) {
    console.error("Failed to send push notification:", error);
    return false;
  }
};

const sendMultiplePushNotifications = async (
  tokens,
  title,
  body,
  data = {}
) => {
  const app = getFirebaseApp();
  if (!app || !tokens || tokens.length === 0) {
    console.log(
      "Firebase not available or no tokens, skipping push notifications"
    );
    return [];
  }

  try {
    const message = {
      notification: {
        title,
        body,
      },
      data: {
        ...data,
        timestamp: new Date().toISOString(),
      },
      android: {
        notification: {
          icon: "ic_notification",
          color: "#6b7cff",
          sound: "default",
        },
      },
      apns: {
        payload: {
          aps: {
            sound: "default",
            badge: 1,
          },
        },
      },
    };

    const response = await admin.messaging().sendMulticast({
      tokens,
      ...message,
    });

    console.log(
      `Sent ${response.successCount} push notifications successfully`
    );
    if (response.failureCount > 0) {
      console.log(
        "Failed tokens:",
        response.responses
          .filter((r, i) => !r.success)
          .map((r, i) => ({ token: tokens[i], error: r.error }))
      );
    }

    return response.responses;
  } catch (error) {
    console.error("Failed to send multiple push notifications:", error);
    return [];
  }
};

module.exports = {
  initializeFirebase,
  getFirebaseApp,
  sendPushNotification,
  sendMultiplePushNotifications,
};
