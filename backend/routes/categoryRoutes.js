const express = require('express');
const router = express.Router();

const categoryController = require('modules/category/controllers/categoryController');
const categoryValidation = require('modules/category/validations/categoryValidation');
const validateMiddleware = require('middlewares/validateMiddleware');
const authMiddleware = require('middlewares/authMiddleware');
const authorizationMiddleware = require('middlewares/authorizationMiddleware');

// Require login for all routes
router.use(authMiddleware.authenticate);
router.use(authorizationMiddleware.requireAuth);

// Accessible by both user and admin — no need to check role
router.post('/',
    categoryValidation.create,
    validateMiddleware,
    categoryController.create
);

router.get('/',
    categoryController.getAll
);

router.get('/:categoryid',
    categoryValidation.getById,
    validateMiddleware,
    categoryController.getById
);

// Admin-only routes
router.put('/:categoryid',
    authorizationMiddleware.requireAdmin,
    categoryValidation.update,
    validateMiddleware,
    categoryController.update
);

router.delete('/:categoryid',
    authorizationMiddleware.requireAdmin,
    categoryValidation.delete,
    validateMiddleware,
    categoryController.delete
);
router.delete('/permanent/:categoryid',
    authorizationMiddleware.requireAdmin,
    categoryValidation.delete,
    validateMiddleware,
    categoryController.permanentDelete
);


module.exports = router;
