const nodemailer = require("nodemailer");

// Sends an email using configured SMTP credentials.
// Falls back to a free Ethereal test account in development when no SMTP is configured.
module.exports = async (to, text) => {
  const fromAddress =
    process.env.EMAIL_FROM ||
    '"TrackMyLaundry" <no-reply@trackmylaundry.local>';

  const createPrimary = () => {
    if (
      process.env.SMTP_HOST ||
      process.env.SMTP_USER ||
      process.env.SMTP_PASS
    ) {
      return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    }
    return null;
  };

  const createEthereal = async () => {
    const testAccount = await nodemailer.createTestAccount();
    console.log("Using Ethereal test SMTP account:", testAccount.user);
    return nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  };

  const sendWith = async (transporter) => {
    const info = await transporter.sendMail({
      from: fromAddress,
      to,
      subject: "OTP Verification",
      text,
    });
    const previewUrl = nodemailer.getTestMessageUrl?.(info);
    if (previewUrl) {
      console.log("Ethereal email preview URL:", previewUrl);
    } else {
      console.log("Email sent successfully to", to);
    }
  };

  const primary = createPrimary();
  if (primary) {
    try {
      await sendWith(primary);
      return;
    } catch (err) {
      console.error("Primary SMTP send failed:", err.message || err);
      if ((process.env.NODE_ENV || "development") !== "production") {
        const ethereal = await createEthereal();
        await sendWith(ethereal);
        return;
      }
      throw err;
    }
  }

  const ethereal = await createEthereal();
  await sendWith(ethereal);
};
