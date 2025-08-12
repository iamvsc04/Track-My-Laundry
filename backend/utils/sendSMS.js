// Example using Twilio
// const twilio = require('twilio');
// const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

module.exports = async (to, text) => {
  try {
    if (
      process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_FROM
    ) {
      const twilio = require("twilio");
      const client = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );
      await client.messages.create({
        to,
        body: text,
        from: process.env.TWILIO_FROM,
      });
      return;
    }
    // Fallback: log the OTP for development/testing
    console.log(`SMS to ${to}: ${text}`);
  } catch (err) {
    console.error("Failed to send SMS:", err.message || err);
    throw err;
  }
};
