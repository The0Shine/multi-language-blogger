const express = require("express");
const router = express.Router();

// Import module-specific routes
const authRoutes = require("routes/authRoutes");
const userRoutes = require("routes/userRoutes");
// const postRoutes = require("routes/postRoutes");
// Add other routes as needed

// Use module-specific routes
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
// router.use("/posts", postRoutes);
// // Add other routes as needed

module.exports = router;