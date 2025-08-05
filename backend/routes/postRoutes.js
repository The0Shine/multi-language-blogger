const express = require('express');
const router = express.Router();

const postController = require('modules/post/controllers/postController');
const postValidation = require('modules/post/validations/postValidation');
const validateMiddleware = require('middlewares/validateMiddleware');
const authMiddleware = require('middlewares/authMiddleware');
const uploadMiddleware = require('middlewares/uploadMiddleware');

// Require login for all routes
router.use(authMiddleware.authenticate);

// Người dùng thường — chỉ được tạo post
router.post('/',
    postValidation.create,
    validateMiddleware,
    postController.create
);

// Admin-only routes
router.get('/',
    authMiddleware.authorizeRoles('admin'),
    postController.getAll
);

router.delete('/:postid',
    authMiddleware.authorizeRoles('admin'),
    validateMiddleware,
    postController.delete
);

router.patch('/:postid/accept',
    authMiddleware.authorizeRoles('admin'),
    validateMiddleware,
    postController.accept
);

router.patch('/:postid/reject',
    authMiddleware.authorizeRoles('admin'),
    validateMiddleware,
    postController.reject
);

// Upload for authenticated users (both admin & user)
router.post(
    '/upload',
    uploadMiddleware.single('file'),
    postController.upload
);

module.exports = router;
