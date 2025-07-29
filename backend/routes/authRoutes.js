const express = require("express");
const router = express.Router();
const authController = require("modules/auth/controllers/authController");
const authMiddleware = require("middlewares/authMiddleware");

// Authentication routes
router.post("/register", authController.register);
router.post("/login", authMiddleware.authenticate, authController.login);


module.exports = router;