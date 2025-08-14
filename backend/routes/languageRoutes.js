// backend/routes/languageRoutes.js
const express = require('express');
const router = express.Router();

const authMiddleware = require('middlewares/authMiddleware');
const validateMiddleware = require('middlewares/validateMiddleware');

const languageValidation = require('modules/language/validations/languageValidation');
const languageController = require('modules/language/controllers/languageController');

// 🔐 All language APIs are admin-only
router.use(authMiddleware.authenticate, authMiddleware.requireRoles('admin'));

// List languages (optional ?onlyActive=1)
router.get('/admin/languages', languageController.getAll);

// Get one language
router.get(
  '/admin/languages/:languageid',
  languageValidation.getById,
  validateMiddleware,
  languageController.getById
);

// Create language
router.post(
  '/admin/languages',
  languageValidation.create,
  validateMiddleware,
  languageController.create
);

// Update language
router.put(
  '/admin/languages/:languageid',
  languageValidation.update,
  validateMiddleware,
  languageController.update
);

// Soft delete language
router.delete(
  '/admin/languages/:languageid',
  languageValidation.delete,
  validateMiddleware,
  languageController.delete
);

// Hard delete language
router.delete(
  '/admin/languages/:languageid/hard',
  languageValidation.delete,
  validateMiddleware,
  languageController.permanentDelete
);

// Restore soft-deleted language
router.post(
  '/admin/languages/:languageid/restore',
  languageValidation.getById,
  validateMiddleware,
  languageController.restore
);

module.exports = router;
