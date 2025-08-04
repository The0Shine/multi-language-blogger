const express = require("express");
const router = express.Router();
const authController = require("modules/auth/controllers/authController");
const authValidation = require("modules/auth/validations/authValidation");
const validateMiddleware = require("middlewares/validateMiddleware");
const authMiddleware = require("middlewares/authMiddleware");
const loginLimiter = require("middlewares/rateLimitMiddleware");

// Authentication routes
router.post("/register", 
    authValidation.register,
    validateMiddleware,
    authController.register
);

// Admin registration route (no authentication required for initial admin setup)
router.post("/register-admin", 
    authValidation.register,
    validateMiddleware,
    authController.registerAdmin
);

router.post("/login", 
    loginLimiter,
    authValidation.login,
    validateMiddleware,
    authController.login
);
router.post('/refresh-token', authController.refreshToken);

router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

module.exports = router;