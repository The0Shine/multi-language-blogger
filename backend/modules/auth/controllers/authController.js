const authService = require("../services/authService");
const responseUtils = require("utils/responseUtils");
const jwtUtils = require("utils/jwtUtils");

const authController = {
  register: async (req, res) => {
    try {
      console.log("Registration request body:", req.body);
      const { user } = await authService.register(req.body);

      // Generate tokens for the new user
      const accessToken = jwtUtils.generateToken({
        userid: user.userid,
        email: user.email,
        roleid: user.roleid,
      });

      const refreshToken = jwtUtils.generateRefreshToken({
        userid: user.userid,
      });

      return responseUtils.ok(res, {
        message: "User registered successfully.",
        user: {
          userid: user.userid,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          username: user.username,
          roleid: user.roleid,
        },
        token: accessToken,
        refreshToken: refreshToken,
      });
    } catch (error) {
      console.error("Registration error:", error);
      return responseUtils.badRequest(res, error.message);
    }
  },

  registerAdmin: async (req, res) => {
    try {
      console.log("Admin registration request body:", req.body);
      const { user } = await authService.registerAdmin(req.body);

      return responseUtils.ok(res, {
        message: "Admin registered successfully.",
        user: {
          userid: user.userid,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          username: user.username,
          roleid: user.roleid,
        },
      });
    } catch (error) {
      console.error("Admin registration error:", error);
      return responseUtils.badRequest(res, error.message);
    }
  },

  login: async (req, res) => {
    try {
      const authHeader = req.headers.authorization;

      // Nếu có token trong Authorization header
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.split(" ")[1];

        try {
          jwtUtils.verifyToken(token);
          return responseUtils.badRequest(res, "Already logged in.");
        } catch (err) {
          return responseUtils.unauthorized(res, "Invalid or expired token.");
        }
      }

      // Nếu không có token → cho login
      const { accessToken, refreshToken, user } = await authService.login(
        req.body
      );
      return responseUtils.ok(res, {
        message: "Login successful.",
        accessToken,
        refreshToken,
        user: {
          userid: user.userid,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          username: user.username,
          roleid: user.roleid,
          roleName: user.role?.name || "user",
        },
      });
    } catch (error) {
      console.error("Login error:", error);
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
        accessToken,
      });
    } catch (error) {
      console.error("Refresh token error:", error);
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
      console.error("Forgot password error:", error);
      return responseUtils.badRequest(res, error.message);
    }
  },

  resetPassword: async (req, res) => {
    try {
      const { email, resetCode, newPassword } = req.body;

      if (!email || !resetCode || !newPassword) {
        return responseUtils.badRequest(
          res,
          "Email, reset code, and new password are required."
        );
      }

      if (newPassword.length < 6) {
        return responseUtils.badRequest(
          res,
          "Password must be at least 6 characters long."
        );
      }

      const result = await authService.resetPassword(
        email,
        resetCode,
        newPassword
      );
      return responseUtils.ok(res, result);
    } catch (error) {
      console.error("Reset password error:", error);
      return responseUtils.badRequest(res, error.message);
    }
  },
};

module.exports = authController;
