// backend/modules/role/validations/roleValidation.js
const { body, param, query } = require('express-validator');

const roleValidation = {
  // POST /admin/roles
  create: [
    body('name')
      .trim()
      .notEmpty().withMessage('name is required')
      .isLength({ max: 100 }).withMessage('name is too long (max 100)'),
    body('status')
      .optional()
      .isInt({ min: 0, max: 1 }).withMessage('status must be 0 or 1'),
    body('discription')
      .optional()
      .isLength({ max: 255 }).withMessage('discription is too long (max 255)'),
  ],

  // PUT /admin/roles/:roleid
  update: [
    param('roleid')
      .isInt({ min: 1 }).withMessage('Invalid role id'),
    body('name')
      .optional()
      .trim()
      .notEmpty().withMessage('name cannot be empty')
      .isLength({ max: 100 }).withMessage('name is too long (max 100)'),
    body('status')
      .optional()
      .isInt({ min: 0, max: 1 }).withMessage('status must be 0 or 1'),
    body('discription')
      .optional()
      .isLength({ max: 255 }).withMessage('discription is too long (max 255)'),
  ],

  // GET /admin/roles/:roleid
  getById: [
    param('roleid')
      .isInt({ min: 1 }).withMessage('Invalid role id'),
  ],

  // DELETE /admin/roles/:roleid
  delete: [
    param('roleid')
      .isInt({ min: 1 }).withMessage('Invalid role id'),
  ],

  // GET /admin/roles?onlyActive=1 (nếu dùng)
  list: [
    query('onlyActive')
      .optional()
      .isIn(['0', '1']).withMessage('onlyActive must be 0 or 1'),
  ],
};

module.exports = roleValidation;
