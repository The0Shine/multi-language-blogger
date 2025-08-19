const roleService = require("modules/role/services/roleService");
const userService = require("modules/user/services/userService"); // <<< THÊM MỚI: Import userService
const responseUtils = require("utils/responseUtils");

const roleController = {
  // Create new role with permissions
  create: async (req, res) => {
    try {
      const role = await roleService.create(req.body);
      return responseUtils.ok(res, {
        message: "Role created successfully",
        data: role,
      });
    } catch (error) {
      console.error("Create role error:", error);
      return responseUtils.badRequest(
        res,
        error.message || "Failed to create role"
      );
    }
  },

  // Get all roles
  getAll: async (req, res) => {
    try {
      const onlyActive = String(req.query.onlyActive || "") === "1";
      const roles = await roleService.getAll({ onlyActive });
      return responseUtils.ok(res, {
        message: "Roles retrieved successfully",
        data: roles,
      });
    } catch (error) {
      console.error("Get all roles error:", error);
      return responseUtils.serverError(res, error.message);
    }
  },

  // Get role by ID
  getById: async (req, res) => {
    try {
      const role = await roleService.getById(req.params.roleid);
      if (!role) {
        return responseUtils.notFound(res, "Role not found");
      }
      return responseUtils.ok(res, {
        message: "Role retrieved successfully",
        data: role,
      });
    } catch (error) {
      console.error("Get role by ID error:", error);
      return responseUtils.serverError(res, error.message);
    }
  },

  // Update role + sync permissions
  update: async (req, res) => {
    try {
      const { roleid } = req.params;
      const { io, userSocketMap } = req; // <<< THÊM MỚI: Lấy io và map từ request

      const updatedRole = await roleService.update(req.params.roleid, req.body);
      if (!updatedRole) {
        return responseUtils.notFound(res, "Role not found");
      }
      // <<< THÊM MỚI: Logic gửi sự kiện cho tất cả user bị ảnh hưởng >>>
      console.log(`Role ${roleid} updated. Finding affected users...`);
      const affectedUserIds = await userService.findUserIdsByRole(roleid);

      console.log(`Found ${affectedUserIds.length} users with this role.`);

      for (const userId of affectedUserIds) {
        const targetSocketId = userSocketMap[userId];
        if (targetSocketId) {
          io.to(targetSocketId).emit("permissions_changed", {
            message:
              "Permissions for your user role have been changed. Please log in again.",
          });
          console.log(`✅ Sent 'permissions_changed' event to user ${userId}`);
        }
      }

      return responseUtils.ok(res, {
        message: "Role updated successfully",
        data: updatedRole,
      });
    } catch (error) {
      console.error("Update role error:", error);
      return responseUtils.badRequest(
        res,
        error.message || "Failed to update role"
      );
    }
  },

  // Soft delete role
  delete: async (req, res) => {
    try {
      const deleted = await roleService.softDelete(req.params.roleid);
      if (!deleted) {
        return responseUtils.notFound(res, "Role not found");
      }
      return responseUtils.ok(res, {
        message: "Role soft-deleted",
      });
    } catch (error) {
      console.error("Soft delete role error:", error);
      return responseUtils.badRequest(res, error.message);
    }
  },

  // Hard delete role
  permanentDelete: async (req, res) => {
    try {
      const deleted = await roleService.permanentDelete(req.params.roleid);
      if (!deleted) {
        return responseUtils.notFound(
          res,
          "Role not found for permanent delete"
        );
      }
      return responseUtils.ok(res, {
        message: "Role permanently deleted",
      });
    } catch (error) {
      console.error("Hard delete role error:", error);
      return responseUtils.badRequest(res, error.message);
    }
  },
  // Restore role
  restore: async (req, res) => {
    try {
      const restored = await roleService.restore(req.params.roleid);
      if (!restored) {
        return responseUtils.notFound(res, "Role not found to restore");
      }
      return responseUtils.ok(res, {
        message: "Role restored successfully",
      });
    } catch (error) {
      console.error("Restore role error:", error);
      return responseUtils.badRequest(res, error.message);
    }
  },
};

module.exports = roleController;
