// utils/emailUtils.js
const sgMail = require("@sendgrid/mail");
require("dotenv").config();

// nạp API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const emailUtils = {
  sendResetPasswordEmail: async (email, resetCode) => {
    const msg = {
      to: email, // người nhận
      from: process.env.EMAIL_FROM, // người gửi (đã verify trong SendGrid)
      subject: "Password Reset Code",
      text: `Your 6-digit OTP is: ${resetCode}. It expires in 15 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>You have requested to reset your password. Please use the following code to reset your password:</p>
          <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 2px; margin: 20px 0;">
            ${resetCode}
          </div>
          <p>This code will expire in 15 minutes.</p>
          <p>If you didn't request this password reset, please ignore this email.</p>
        </div>
      `,
    };

    try {
      const [res] = await sgMail.send(msg);
      console.log("[sendgrid] status:", res.statusCode, "to:", email);
      return true;
    } catch (error) {
      console.error(
        "[sendgrid] send failed:",
        error.response?.body || error.message
      );
      throw new Error("Failed to send reset email");
    }
  },
};

module.exports = emailUtils;
