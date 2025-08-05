const express = require('express');
const router = express.Router();

const userController = require('modules/user/controllers/userController');
const userValidation = require('modules/user/validations/userValidation');
const validateMiddleware = require('middlewares/validateMiddleware');
const authMiddleware = require('middlewares/authMiddleware');

// Require authentication for all routes
router.use(authMiddleware.authenticate);

// --- Admin-only routes ---
router.get('/admin/stats',
    authMiddleware.authorizeRoles('admin'),
    userController.getUserStats
);

router.get('/admin/users',
    authMiddleware.authorizeRoles('admin'),
    userValidation.getAllUsers,
    validateMiddleware,
    userController.getAllUsers
);

router.get('/admin/users/:userid',
    authMiddleware.authorizeRoles('admin'),
    userValidation.getUserById,
    validateMiddleware,
    userController.getUserById
);

router.put('/admin/users/:userid',
    authMiddleware.authorizeRoles('admin'),
    userValidation.updateUser,
    validateMiddleware,
    userController.updateUser
);

router.patch('/admin/users/:userid/role',
    authMiddleware.authorizeRoles('admin'),
    userValidation.updateUserRole,
    validateMiddleware,
    userController.updateUserRole
);

router.delete('/admin/users/:userid',
    authMiddleware.authorizeRoles('admin'),
    userValidation.deleteUser,
    validateMiddleware,
    userController.deleteUser
);

router.delete('/admin/users/:userid/permanent',
    authMiddleware.authorizeRoles('admin'),
    userValidation.hardDeleteUser,
    validateMiddleware,
    userController.hardDeleteUser
);

// --- Authenticated User Routes (Self-only) ---
router.get('/profile',
    authMiddleware.requireOwnershipOrAdmin(req => req.user.userid), // tự động là chính chủ
    userController.getUserById
);

router.put('/profile',
    authMiddleware.requireOwnershipOrAdmin(req => req.user.userid),
    userValidation.updateUser,
    validateMiddleware,
    userController.updateUser
);

// --- Public Authenticated Routes ---
router.get('/stats',
    userController.getUserStats
);

module.exports = router;
