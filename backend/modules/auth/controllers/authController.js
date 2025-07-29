const authService = require("modules/auth/services/authService");
const responseUtils = require("utils/responseUtils");

const authController = {
    register: async (req, res) => {
        try {
            const { user, accessToken } = await authService.register(req.body);
            return responseUtils.ok(res, {
                message: "User registered successfully.",
                user,
                token: accessToken, // Include the access token in the response
            });
        } catch (error) {
            return responseUtils.serverError(res, error.message);
        }
    },

    login: async (req, res) => {
        try {
            const token = await authService.login(req.body);
            return responseUtils.ok(res, { message: "Login successful.", token });
        } catch (error) {
            return responseUtils.unauthorized(res, error.message);
        }
    },
};

module.exports = authController;