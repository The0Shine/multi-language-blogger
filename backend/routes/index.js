const express = require("express");
const router = express.Router();

// Import all route modules
const authRoutes = require("./authRoutes");
const postRoutes = require("./postRoutes");
const categoryRoutes = require("./categoryRoutes");
const languageRoutes = require("./languageRoutes");
const { commentRouter } = require("./commentsRoutes");
const uploadRoutes = require("./uploadRoutes");
const roleRoutes = require("./roleRoutes");
const userRoutes = require("./userRoutes");

// Mount routes
router.use("/auth", authRoutes);
router.use("/posts", postRoutes);
router.use("/categories", categoryRoutes);
router.use("/languages", languageRoutes);
router.use("/comments", commentRouter);
router.use("/upload", uploadRoutes);
router.use("/roles", roleRoutes);
router.use("/", userRoutes); // Mount user routes at root level

module.exports = router;
