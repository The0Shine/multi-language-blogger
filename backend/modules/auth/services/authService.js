const bcrypt = require("bcrypt");
const crypto = require('crypto');
const jwtUtils = require("utils/jwtUtils");
const emailUtils = require('utils/emailUtils');
const { User, Role } = require("models");

const authService = {
    register: async (data) => {
        const { first_name, last_name, email, username, password } = data;

        // Check if user already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            throw new Error("Email already in use.");
        }

        // Assign a default role if roleid is not provided
        const defaultRole = await Role.findOne({ where: { name: "User" } }); // Replace "User" with your default role name
        if (!defaultRole) {
            throw new Error("Default role not found. Please set up roles in the database.");
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the user
        const newUser = await User.create({
            first_name,
            last_name,
            email,
            username,
            password: hashedPassword,
            roleid: defaultRole.roleid, // Assign the default role ID
            status: 1, // Active by default
        });

        // Generate access token
        const payload = { userid: newUser.userid, roleid: newUser.roleid };
        const accessToken = jwtUtils.generateToken(payload);
        const refreshToken = jwtUtils.generateRefreshToken(payload);

        return { user: newUser, accessToken, refreshToken };
    },

    login: async (data) => {
        const { username, password } = data;

        // Find user by username
        const user = await User.findOne({ where: { username } });
        if (!user) {
            throw new Error("User not found.");
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new Error("Invalid credentials.");
        }

        // Generate JWT token
        return jwtUtils.generateToken({ userid: user.userid, roleid: user.roleid });
    },

    refreshToken: async (refreshToken) => {
        const decoded = jwtUtils.verifyRefreshToken(refreshToken);
        const user = await User.findByPk(decoded.userid);
        if (!user) {
            throw new Error("User not found.");
        }
        const payload = { userid: user.userid, roleid: user.roleid };
        const newAccessToken = jwtUtils.generateToken(payload);
        return { accessToken: newAccessToken };
    },

    forgotPassword: async (email) => {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            throw new Error("User with this email does not exist.");
        }
        // Generate 6-digit reset code
        const resetCode = crypto.randomInt(100000, 999999).toString();
        const resetExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now

        // Store reset code and expiry in extra_info as JSON
        const resetData = {
            resetCode,
            resetExpiry: resetExpiry.toISOString(),
        };
        await user.update({
            extra_info: JSON.stringify(resetData),
        });

        // Send email with reset code
        await emailUtils.sendResetPasswordEmail(email, resetCode);

        return { message: "Reset code sent to your email." };
    },

    resetPassword: async (email, resetCode, newPassword) => {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            throw new Error("User with this email does not exist.");
        }
        if (!user.extra_info) {
            throw new Error("No reset code found. Please request a new one.");
        }
        let resetData;
        try {
            resetData = JSON.parse(user.extra_info);
        } catch (error) {
            throw new Error("Invalid reset data. Please request a new reset code.");
        }
        if (!resetData.resetCode || !resetData.resetExpiry) {
            throw new Error("No valid reset code found. Please request a new one.");
        }
        // Check if code matches
        if (resetData.resetCode !== resetCode) {
            throw new Error("Invalid reset code.");
        }
        // Check if code has expired
        const now = new Date();
        const expiry = new Date(resetData.resetExpiry);
        if (now > expiry) {
            throw new Error("Reset code has expired. Please request a new one.");
        }
        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        // Update password and clear reset data
        await user.update({
            password: hashedPassword,
            extra_info: null, // Clear reset data
        });
        return { message: "Password reset successfully." };
    },
};

module.exports = authService;