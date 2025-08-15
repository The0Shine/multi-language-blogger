// backend/routes/rolePermissionRoutes.js
const express = require('express');
const router = express.Router();

const auth = require('middlewares/authMiddleware');
const validateMiddleware = require('middlewares/validateMiddleware');
const rpValidation = require('modules/role/validations/rolePermissionValidation');
const rpController = require('modules/role/controllers/rolePermissionController');

// Admin only
router.use(auth.authenticate, auth.requireRoles('admin'));

// backend/routes/rolePermissionRoutes.js
router.get('/admin/permissions',
  rpController.list
);


// Gán quyền có sẵn cho role
router.post(
  '/admin/role-permissions/:roleid/permissions',
  rpValidation.modify,
  validateMiddleware,
  rpController.addPermissions
);

// Bỏ quyền khỏi role
router.delete(
  '/admin/role-permissions/:roleid/permissions',
  rpValidation.modify,
  validateMiddleware,
  rpController.removePermissions
);

module.exports = router;