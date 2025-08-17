const express = require("express");
const router = express.Router();

// Import all route modules
const { commentRouter } = require("./commentsRoutes");
const uploadRoutes = require("./uploadRoutes");
// Import module-specific routes
const authRoutes = require("routes/authRoutes");
const userRoutes = require("routes/userRoutes");
const categoryRoutes = require("routes/categoryRoutes");
const postRoutes = require("routes/postRoutes");
const roleRoutes = require("routes/roleRoutes");
const languageRoutes = require("routes/languageRoutes");

const rolePermissionRoutes = require("routes/rolePermissionRoutes");

// Add other routes as needed

// Mount routes
router.use("/auth", authRoutes);
router.use("/posts", postRoutes);
router.use("/categories", categoryRoutes);
router.use("/languages", languageRoutes);
router.use("/comments", commentRouter);
router.use("/upload", uploadRoutes);
router.use("/roles", roleRoutes);
router.use("/", userRoutes); // Mount user routes at root level

router.use("/role-permissions", rolePermissionRoutes);

module.exports = router;
