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
                        ${resetCode}
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
