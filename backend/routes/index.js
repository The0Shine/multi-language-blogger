const express = require("express");
const router = express.Router();

// Import module-specific routes
const authRoutes = require("./authRoutes");
// const userRoutes = require("./userRoutes");
// const postRoutes = require("./postRoutes");
// Add other routes as needed

// Use module-specific routes
router.use("/auth", authRoutes);
// router.use("/users", userRoutes);
// router.use("/posts", postRoutes);
// // Add other routes as needed

module.exports = router;