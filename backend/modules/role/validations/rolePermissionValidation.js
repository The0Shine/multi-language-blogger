// backend/modules/role/validations/rolePermissionValidation.js
const { body, param } = require('express-validator');

const rpValidation = {
  modify: [
    param('roleid')
      .isInt({ min: 1 }).withMessage('Invalid role id'),

    body('permissionIds')
      .isArray({ min: 1 }).withMessage('permissionIds must be a non-empty array'),
    body('permissionIds.*')
      .isInt({ min: 1 }).withMessage('Each permission id must be a positive integer')
  ]
};

module.exports = rpValidation;
