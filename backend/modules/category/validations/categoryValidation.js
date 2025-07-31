const { body, param } = require('express-validator');

const categoryValidation = {
  create: [
    body('category_name')
      .notEmpty()
      .withMessage('Category name is required.'),
  ],
  update: [
    body('category_name')
      .optional()
      .notEmpty()
      .withMessage('Category name cannot be empty.'),
    body('status')
      .optional()
      .isIn([0, 1])
      .withMessage('Status must be 0 or 1.'),
  ],
  getById: [
    param('categoryid')
      .isInt({ min: 1 })
      .withMessage('Invalid category ID.')
  ],
    delete: [
    param('categoryid')
      .isInt({ min: 1 })
      .withMessage('Invalid category ID.')
  ]
};

module.exports = categoryValidation;
