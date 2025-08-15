const express = require("express");
const router = express.Router();

const authController = require("../modules/auth/controllers/authController");
const authValidation = require("../modules/auth/validations/authValidation");
const validateMiddleware = require("../middlewares/validateMiddleware");

// User registration
router.post(
  "/register",
  authValidation.register,
  validateMiddleware,
  authController.register
);

// Admin registration
router.post(
  "/register-admin",
  authValidation.registerAdmin,
  validateMiddleware,
  authController.registerAdmin
);

// User login
router.post(
  "/login",
  authValidation.login,
  validateMiddleware,
  authController.login
);

// Refresh token
router.post(
  "/refresh-token",
  authValidation.refreshToken,
  validateMiddleware,
  authController.refreshToken
);

// Forgot password
router.post(
  "/forgot-password",
  authValidation.forgotPassword,
  validateMiddleware,
  authController.forgotPassword
);

// Reset password
router.post(
  "/reset-password",
  authValidation.resetPassword,
  validateMiddleware,
  authController.resetPassword
);

module.exports = router;
