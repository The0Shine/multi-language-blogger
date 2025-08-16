// backend/routes/languageRoutes.js
const express = require("express");
const router = express.Router();

const languageController = require("../modules/language/controllers/languageController");
const languageValidation = require("../modules/language/validations/languageValidation");
const validateMiddleware = require("../middlewares/validateMiddleware");
const authMiddleware = require("../middlewares/authMiddleware");

// Public routes
// Get all active languages
router.get("/", languageController.getAll);

// Admin routes - require authentication and admin role
router.use("/admin", authMiddleware.authenticate);
router.use("/admin", authMiddleware.requireRoles("admin"));

// Admin: Get all languages (including inactive)
router.get("/admin/languages", languageController.getAll);

// Admin: Get language by ID
router.get(
  "/admin/languages/:languageid",
  languageValidation.getById,
  validateMiddleware,
  languageController.getById
);

// Admin: Create language
router.post(
  "/admin/languages",
  languageValidation.create,
  validateMiddleware,
  languageController.create
);

// Admin: Update language
router.put(
  "/admin/languages/:languageid",
  languageValidation.update,
  validateMiddleware,
  languageController.update
);

// Admin: Soft delete language
router.delete(
  "/admin/languages/:languageid",
  languageValidation.delete,
  validateMiddleware,
  languageController.delete
);

// Admin: Hard delete language
router.delete(
  "/admin/languages/:languageid/hard",
  languageValidation.delete,
  validateMiddleware,
  languageController.permanentDelete
);

module.exports = router;
