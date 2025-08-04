const authService = require("modules/auth/services/authService");
const responseUtils = require("utils/responseUtils");
const jwtUtils = require("utils/jwtUtils");

const authController = {
    register: async (req, res) => {
        try {
            console.log('Registration request body:', req.body);
            const { user, accessToken, refreshToken } = await authService.register(req.body);
            
            // Direct response for testing
            return res.status(200).json({
                success: true,
                message: "User registered successfully.",
                user: {
                    userid: user.userid,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    email: user.email,
                    username: user.username,
                    roleid: user.roleid
                },
            });
        } catch (error) {
            console.error('Registration error:', error);
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    registerAdmin: async (req, res) => {
        try {
            console.log('Admin registration request body:', req.body);
            const { user, accessToken, refreshToken } = await authService.registerAdmin(req.body);
            
            return res.status(200).json({
                success: true,
                message: "Admin registered successfully.",
                user: {
                    userid: user.userid,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    email: user.email,
                    username: user.username,
                    roleid: user.roleid
                },
            });
        } catch (error) {
            console.error('Admin registration error:', error);
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    login: async (req, res) => {
        try {
            const authHeader = req.headers.authorization;

            // Nếu có token trong Authorization header
            if (authHeader && authHeader.startsWith("Bearer ")) {
                const token = authHeader.split(" ")[1];

                try {
                    // Thử verify token
                    jwtUtils.verifyToken(token);
                    // Nếu token hợp lệ → không cho login lại
                    return responseUtils.badRequest(res, "Already logged in.");
                } catch (err) {
                    // Nếu token sai hoặc hết hạn → báo lỗi
                    return responseUtils.unauthorized(res, "Invalid or expired token.");
                }
            }

            // Nếu không có token → cho login
            const { accessToken, refreshToken } = await authService.login(req.body);
            return responseUtils.ok(res, {
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