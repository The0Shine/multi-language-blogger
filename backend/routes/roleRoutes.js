// backend/routes/roleRoutes.js
const express = require("express");
const router = express.Router();

const authMiddleware = require("middlewares/authMiddleware");
const validateMiddleware = require("middlewares/validateMiddleware"); // giữ nguyên tên
const roleValidation = require("modules/role/validations/roleValidation");
const roleController = require("modules/role/controllers/roleController");

// Chỉ admin mới được dùng các API này
router.use(authMiddleware.authenticate, authMiddleware.requireRoles("admin"));

// Lấy danh sách roles
router.get("/admin/roles", roleController.getAll);

// Lấy 1 role theo id
router.get(
  "/admin/roles/:roleid",
  roleValidation.getById,
  validateMiddleware,
  roleController.getById
);

// Tạo role mới
router.post(
  "/admin/roles",
  roleValidation.create,
  validateMiddleware,
  roleController.create
);

// Cập nhật role
router.put(
  "/admin/roles/:roleid",
  roleValidation.update,
  validateMiddleware,
  roleController.update
);

// Soft delete role
router.delete(
  "/admin/roles/:roleid",
  roleValidation.delete,
  validateMiddleware,
  roleController.delete
);

// Hard delete role
router.delete(
  "/admin/roles/:roleid/hard",
  roleValidation.delete,
  validateMiddleware,
  roleController.permanentDelete
);

// Khôi phục role
router.post(
  "/admin/roles/:roleid/restore",
  roleValidation.getById,
  validateMiddleware,
  roleController.restore
);

module.exports = router;
