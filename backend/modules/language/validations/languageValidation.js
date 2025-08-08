const { body, param, query } = require('express-validator');

// Accepts "en", "vi", "en-US", "fr-CA", etc.
const localeRegex = /^[A-Za-z]{2,3}(-[A-Za-z0-9]{2,8})?$/;

const languageValidation = {
  // POST /admin/languages
  create: [
    body('language_name')
      .trim()
      .notEmpty().withMessage('language_name is required')
      .isLength({ max: 100 }).withMessage('language_name too long (max 100)'),
    body('locale_code')
      .trim()
      .notEmpty().withMessage('locale_code is required')
      .matches(localeRegex).withMessage('locale_code format invalid (e.g., en, en-US)'),
    body('status')
      .optional()
      .isInt({ min: 0, max: 1 }).withMessage('status must be 0 or 1'),
  ],

  // PUT /admin/languages/:languageid
  update: [
    param('languageid').isInt({ min: 1 }).withMessage('Invalid language id'),
    body('language_name')
      .optional()
      .trim()
      .notEmpty().withMessage('language_name cannot be empty')
      .isLength({ max: 100 }).withMessage('language_name too long (max 100)'),
    body('locale_code')
      .optional()
      .trim()
      .matches(localeRegex).withMessage('locale_code format invalid (e.g., en, en-US)'),
    body('status')
      .optional()
      .isInt({ min: 0, max: 1 }).withMessage('status must be 0 or 1'),
  ],

  // GET /admin/languages/:languageid
  getById: [
    param('languageid').isInt({ min: 1 }).withMessage('Invalid language id'),
  ],

  // DELETE /admin/languages/:languageid
  delete: [
    param('languageid').isInt({ min: 1 }).withMessage('Invalid language id'),
  ],

  // GET /admin/languages?onlyActive=1
  list: [
    query('onlyActive').optional().isIn(['0', '1']).withMessage('onlyActive must be 0 or 1'),
  ],
};

module.exports = languageValidation;
