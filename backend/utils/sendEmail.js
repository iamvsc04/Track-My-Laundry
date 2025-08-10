const nodemailer = require("nodemailer");

module.exports = async (to, text) => {
  try {
    // Replace with your Gmail and App Password
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "itzzmevsc4@gmail.com", // <-- Replace with your Gmail address
        pass: "aigxnocyltnppdvf", // <-- Replace with your Gmail App Password
      },
    });

    await transporter.sendMail({
      from: "TrackMyLaundry itzzmevsc4@gmail.com", // <-- Use your Gmail address
      to,
      subject: "OTP Verification",
      text,
    });
    console.log("Email sent successfully to", to);
  } catch (error) {
    console.error("Failed to send email:", error);
  }
};
