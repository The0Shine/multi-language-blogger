const express = require("express");
const router = express.Router();
const authController = require("modules/auth/controllers/authController");
const authMiddleware = require("middlewares/authMiddleware");

// Authentication routes
router.post("/register", authController.register);
router.post("/login", authMiddleware.authenticate, authController.login);
router.post('/refresh-token', authController.refreshToken);

router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);


module.exports = router;