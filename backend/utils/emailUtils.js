const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: 'smtp.mailtrap.io',
    port: 2525,
    auth: {
        user: '15fb50e8fde291',
        pass: '0a1efd07917627'
    }
});

const emailUtils = {
    sendResetPasswordEmail: async (email, resetCode) => {
        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: email,
            subject: 'Password Reset Code',
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
            await transporter.sendMail(mailOptions);
            return true;
        } catch (error) {
            console.error('Email sending failed:', error);
            throw new Error('Failed to send reset email');
        }
    },
};

module.exports = emailUtils;
