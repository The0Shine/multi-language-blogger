const authService = require("modules/auth/services/authService");
const responseUtils = require("utils/responseUtils");

const authController = {
    register: async (req, res) => {
        try {
            const { user, accessToken, refreshToken } = await authService.register(req.body);
            return res.status(200).json({
                message: "User registered successfully.",
                user,
                accessToken,
                refreshToken,
            });
        } catch (error) {
            return responseUtils.serverError(res, error.message);
        }
    },

    login: async (req, res) => {
        try {
            const { accessToken, refreshToken } = await authService.login(req.body);
            return res.status(200).json({
                message: "Login successful.",
                accessToken,
                refreshToken,
            });
        } catch (error) {
            return responseUtils.unauthorized(res, error.message);
        }
    },

    refreshToken: async (req, res) => {
        try {
            const { refreshToken } = req.body;
            if (!refreshToken) {
                return responseUtils.badRequest(res, "Refresh token is required.");
            }
            const { accessToken } = await authService.refreshToken(refreshToken);
            return responseUtils.ok(res, { 
                message: "Token refreshed successfully.", 
                accessToken 
            });
        } catch (error) {
            return responseUtils.unauthorized(res, error.message);
        }
    },

    forgotPassword: async (req, res) => {
        try {
            const { email } = req.body;
            if (!email) {
                return responseUtils.badRequest(res, "Email is required.");
            }
            const result = await authService.forgotPassword(email);
            return responseUtils.ok(res, result);
        } catch (error) {
            return responseUtils.badRequest(res, error.message);
        }
    },

    resetPassword: async (req, res) => {
        try {
            const { email, resetCode, newPassword } = req.body;
            if (!email || !resetCode || !newPassword) {
                return responseUtils.badRequest(res, "Email, reset code, and new password are required.");
            }
            if (newPassword.length < 6) {
                return responseUtils.badRequest(res, "Password must be at least 6 characters long.");
            }
            const result = await authService.resetPassword(email, resetCode, newPassword);
            return responseUtils.ok(res, result);
        } catch (error) {
            return responseUtils.badRequest(res, error.message);
        }
    },
};

module.exports = authController;