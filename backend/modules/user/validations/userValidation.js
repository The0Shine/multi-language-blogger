const { body, param, query } = require('express-validator');

const userValidation = {
    // Validation for getting all users
    getAllUsers: [
        query('page')
            .optional()
            .isInt({ min: 1 })
            .withMessage('Page must be a positive integer'),
        query('limit')
            .optional()
            .isInt({ min: 1, max: 100 })
            .withMessage('Limit must be between 1 and 100'),
        query('search')
            .optional()
            .isString()
            .trim()
            .isLength({ max: 100 })
            .withMessage('Search term must be less than 100 characters')
    ],

    // Validation for getting user by ID
    getUserById: [
        param('userid')
            .isInt({ min: 1 })
            .withMessage('User ID must be a positive integer')
    ],

    // Validation for updating user (excluding role)
    updateUser: [
        param('userid')
            .isInt({ min: 1 })
            .withMessage('User ID must be a positive integer'),
        body('first_name')
            .notEmpty()
            .trim()
            .isLength({ min: 2, max: 50 })
            .withMessage('First name must be between 2 and 50 characters'),
        body('last_name')
            .notEmpty()
            .trim()
            .isLength({ min: 2, max: 50 })
            .withMessage('Last name must be between 2 and 50 characters'),
        body('email')
            .notEmpty()
            .isEmail()
            .normalizeEmail()
            .withMessage('Please provide a valid email address'),
        body('username')
            .optional()
            .trim()
            .isLength({ min: 3, max: 30 })
            .withMessage('Username must be 3-30 characters long'),
        body('password')
            .optional()
            .isLength({ min: 6 })
            .withMessage('Password must be at least 6 characters long'),
        body('status')
            .optional()
            .isIn([0, 1])
            .withMessage('Status must be 0 or 1')
    ],

    // Validation for updating user role
    updateUserRole: [
        param('userid')
            .isInt({ min: 1 })
            .withMessage('User ID must be a positive integer'),
        body('roleid')
            .notEmpty()
            .isInt({ min: 1 })
            .withMessage('Role ID must be a positive integer')
    ],

    // Validation for deleting user
    deleteUser: [
        param('userid')
            .isInt({ min: 1 })
            .withMessage('User ID must be a positive integer')
    ],

    // Validation for hard deleting user
    hardDeleteUser: [
        param('userid')
            .isInt({ min: 1 })
            .withMessage('User ID must be a positive integer')
    ]
};

module.exports = userValidation;
