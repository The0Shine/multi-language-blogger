const bcrypt = require("bcrypt");
const crypto = require('crypto');
const jwtUtils = require("utils/jwtUtils");
const emailUtils = require('utils/emailUtils');
const { User, Role } = require("models");

const authService = {
    register: async (data) => {
        const transaction = await require('models').sequelize.transaction();
        
        try {
            const { first_name, last_name, email, username, password, roleid =1 } = data;

            const existingUser = await User.findOne({ 
                where: { email },
                transaction 
            });
            if (existingUser) {
                throw new Error("Email already in use.");
            }

            const defaultRole = await Role.findOne({ 
                where: { name: "User" },
                transaction 
            });
            if (!defaultRole) {
                throw new Error("Default role not found. Please set up roles in the database.");
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const newUser = await User.create({
                first_name,
                last_name,
                email,
                username,
                password: hashedPassword,
                roleid: defaultRole.roleid,
                status: 1,
            }, { transaction });

            // Commit transaction only if everything succeeds
            await transaction.commit();

            return { user: newUser};
        } catch (error) {
            // Rollback transaction if anything fails
            await transaction.rollback();
            throw error;
        }
    },

    // Register admin account
    registerAdmin: async (data) => {
        const transaction = await require('models').sequelize.transaction();
        
        try {
            const { first_name, last_name, email, username, password } = data;

            const existingUser = await User.findOne({ 
                where: { email },
                transaction 
            });
            if (existingUser) {
                throw new Error("Email already in use.");
            }

            const adminRole = await Role.findOne({ 
                where: { name: "Admin" },
                transaction 
            });
            if (!adminRole) {
                throw new Error("Admin role not found. Please set up roles in the database.");
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const newAdmin = await User.create({
                first_name,
                last_name,
                email,
                username,
                password: hashedPassword,
                roleid: adminRole.roleid,
                status: 1,
            }, { transaction });

            await transaction.commit();

            return { user: newAdmin};
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    },

    login: async (data) => {
        const { username, password } = data;

        const user = await User.findOne({ where: { username } });
        if (!user) {
            throw new Error("User not found.");
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new Error("Invalid credentials.");
        }

        const payload = { userid: user.userid, roleid: user.roleid };
        const accessToken = jwtUtils.generateToken(payload);
        const refreshToken = jwtUtils.generateRefreshToken(payload);

        return { accessToken, refreshToken };
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