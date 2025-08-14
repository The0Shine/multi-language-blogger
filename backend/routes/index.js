const express = require("express");
const router = express.Router();

// Import module-specific routes
const authRoutes = require("routes/authRoutes");
const userRoutes = require("routes/userRoutes");
const categoryRoutes = require("routes/categoryRoutes");
const postRoutes = require("routes/postRoutes");
const roleRoutes = require("routes/roleRoutes");
const languageRoutes = require("routes/languageRoutes");
const rolePermissionRoutes = require("routes/rolePermissionRoutes");
// Add other routes as needed

// Use module-specific routes
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/categories", categoryRoutes);
router.use("/posts", postRoutes);
router.use("/role", roleRoutes);
router.use("/languages", languageRoutes);
router.use("/role-permissions", rolePermissionRoutes);
// // Add other routes as needed

module.exports = router;