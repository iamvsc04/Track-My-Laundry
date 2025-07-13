const admin = require('firebase-admin');
const twilio = require('twilio');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL
  })
});

// Initialize Twilio client
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Send push notification using Firebase Cloud Messaging
exports.sendNotification = async (fcmToken, { title, body }) => {
  if (!fcmToken) return;

  try {
    const message = {
      notification: {
        title,
        body
      },
      token: fcmToken
    };

    await admin.messaging().send(message);
  } catch (error) {
    console.error('Error sending push notification:', error);
  }
};

// Send SMS notification using Twilio
exports.sendSMS = async (phoneNumber, message) => {
  try {
    await twilioClient.messages.create({
      body: message,
      to: phoneNumber,
      from: process.env.TWILIO_PHONE_NUMBER
    });
  } catch (error) {
    console.error('Error sending SMS:', error);
  }
};

// Send both push notification and SMS
exports.sendNotifications = async (user, { title, body }) => {
  if (user.fcmToken) {
    await exports.sendNotification(user.fcmToken, { title, body });
  }
  
  if (user.phone) {
    await exports.sendSMS(user.phone, `${title}\n${body}`);
  }
}; 