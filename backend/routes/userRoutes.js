const express = require('express');
const router = express.Router();
const userController = require('modules/user/controllers/userController');
const userValidation = require('modules/user/validations/userValidation');
const validateMiddleware = require('middlewares/validateMiddleware');
const authMiddleware = require('middlewares/authMiddleware');
const authorizationMiddleware = require('middlewares/authorizationMiddleware');

// Apply authentication middleware to all routes
router.use(authMiddleware.authenticate);

// Apply authorization middleware - Admin has full access, others have limited access
router.use(authorizationMiddleware.requireAuth);

// Admin-only routes (full access)
router.get('/admin/stats', 
    authorizationMiddleware.requireAdmin,
    userController.getUserStats
);

router.get('/admin/users', 
    authorizationMiddleware.requireAdmin,
    userValidation.getAllUsers,
    validateMiddleware,
    userController.getAllUsers
);

router.get('/admin/users/:userid',
    authorizationMiddleware.requireAdmin,
    userValidation.getUserById,
    validateMiddleware,
    userController.getUserById
);

router.put('/admin/users/:userid',
    authorizationMiddleware.requireAdmin,
    userValidation.updateUser,
    validateMiddleware,
    userController.updateUser
);

router.patch('/admin/users/:userid/role',
    authorizationMiddleware.requireAdmin,
    userValidation.updateUserRole,
    validateMiddleware,
    userController.updateUserRole
);

router.delete('/admin/users/:userid',
    authorizationMiddleware.requireAdmin,
    userValidation.deleteUser,
    validateMiddleware,
    userController.deleteUser
);

router.delete('/admin/users/:userid/permanent',
    authorizationMiddleware.requireAdmin,
    userValidation.hardDeleteUser,
    validateMiddleware,
    userController.hardDeleteUser
);

// User routes (users can access their own data)
router.get('/profile',
    authorizationMiddleware.getUserRole,
    userController.getUserById
);

router.put('/profile',
    authorizationMiddleware.getUserRole,
    userValidation.updateUser,
    validateMiddleware,
    userController.updateUser
);

// Public routes (accessible to all authenticated users)
router.get('/stats',
    userController.getUserStats
);

module.exports = router;
