const express = require("express");
const router = express.Router();

const userController = require("modules/user/controllers/userController");
const userValidation = require("modules/user/validations/userValidation");
const validate = require("middlewares/validateMiddleware");
const authMiddleware = require("middlewares/authMiddleware");

// 🔐 Require login cho toàn bộ route
router.use(authMiddleware.authenticate);

// Current user: get own profile
router.get("/users/profile", userController.getCurrentUserProfile);

// Current user: update own profile
router.put("/users/profile", userController.updateCurrentUserProfile);

// Owner hoặc Admin: xem profile
router.get(
  "/users/:userid",
  authMiddleware.requireOwnershipOrRoles((req) => req.params.userid, "admin"),
  userController.getUserById
);

// Owner hoặc Admin: cập nhật thông tin
router.put(
  "/users/:userid",
  authMiddleware.requireOwnershipOrRoles((req) => req.params.userid, "admin"),
  userValidation.updateUser,
  validate,
  userController.updateUser
);

// Admin: đổi role người khác
router.patch(
  "/admin/users/:userid/role",
  authMiddleware.requireRoles("admin"),
  userController.updateUserRole
);

// Admin: danh sách user
router.get(
  "/admin/users",
  authMiddleware.requireRoles("admin"),
  userController.getAllUsers
);

// Owner hoặc Admin: soft delete
router.delete(
  "/users/:userid",
  authMiddleware.requireOwnershipOrRoles((req) => req.params.userid, "admin"),
  userController.deleteUser
);

// Admin: hard delete
router.delete(
  "/admin/users/:userid",
  authMiddleware.requireRoles("admin"),
  userController.hardDeleteUser
);

// Admin: stats
router.get(
  "/admin/users/stats",
  authMiddleware.requireRoles("admin"),
  userController.getUserStats
);

router.get(
  "/admin/users/stats/detailed",
  authMiddleware.requireRoles("admin"),
  userController.getDetailedUserStats
);

module.exports = router;
