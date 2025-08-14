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
// Cho phép Admin HOẶC bất kỳ role nào có 'moderate_posts'
router.get('/',
  authMiddleware.authenticate,
  authMiddleware.requireRoleOrPermission(['Admin'], ['moderate_posts']),
  postController.getAll
);

router.patch('/:postid/accept',
  authMiddleware.authenticate,
  authMiddleware.requireRoleOrPermission(['Admin'], ['moderate_posts']),
  validateMiddleware,
  postController.accept
);

router.patch('/:postid/reject',
  authMiddleware.authenticate,
  authMiddleware.requireRoleOrPermission(['Admin'], ['moderate_posts']),
  validateMiddleware,
  postController.reject
);

router.delete('/:postid',
  authMiddleware.authenticate,
  authMiddleware.requireRoleOrPermission(['Admin'], ['moderate_posts']),
  validateMiddleware,
  postController.delete
);


// Upload for authenticated users (both admin & user)
router.post(
    '/upload',
    uploadMiddleware.single('file'),
    postController.upload
);

// Get a post by ID (accessible to authenticated users)
router.get('/:postid',
    authMiddleware.authenticate, 
    validateMiddleware,          
    postController.getById       
);

module.exports = router;
