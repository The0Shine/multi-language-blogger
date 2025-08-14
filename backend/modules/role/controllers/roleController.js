const roleService = require('modules/role/services/roleService');
const responseUtils = require('utils/responseUtils');

const roleController = {
  // Create new role
  create: async (req, res) => {
    try {
      const role = await roleService.create(req.body);
      return responseUtils.ok(res, {
        message: 'Role created successfully',
        data: role
      });
    } catch (error) {
      console.error('Create role error:', error);
      return responseUtils.badRequest(res, error.message || 'Failed to create role');
    }
  },

  // Get all roles
  getAll: async (req, res) => {
    try {
      const onlyActive = String(req.query.onlyActive || '') === '1';
      const roles = await roleService.getAll({ onlyActive });
      return responseUtils.ok(res, {
        message: 'Roles retrieved successfully',
        data: roles
      });
    } catch (error) {
      console.error('Get all roles error:', error);
      return responseUtils.serverError(res, error.message);
    }
  },

  // Get role by ID
  getById: async (req, res) => {
    try {
      const role = await roleService.getById(req.params.roleid);
      if (!role) {
        return responseUtils.notFound(res, 'Role not found');
      }
      return responseUtils.ok(res, {
        message: 'Role retrieved successfully',
        data: role
      });
    } catch (error) {
      console.error('Get role by ID error:', error);
      return responseUtils.serverError(res, error.message);
    }
  },

  // Update role
  update: async (req, res) => {
    try {
      const updatedRole = await roleService.update(req.params.roleid, req.body);
      if (!updatedRole) {
        return responseUtils.notFound(res, 'Role not found');
      }
      return responseUtils.ok(res, {
        message: 'Role updated successfully',
        data: updatedRole
      });
    } catch (error) {
      console.error('Update role error:', error);
      return responseUtils.badRequest(res, error.message || 'Failed to update role');
    }
  },

  // Soft delete role
  delete: async (req, res) => {
    try {
      const deleted = await roleService.softDelete(req.params.roleid);
      if (!deleted) {
        return responseUtils.notFound(res, 'Role not found');
      }
      return responseUtils.ok(res, {
        message: 'Role soft-deleted'
      });
    } catch (error) {
      console.error('Soft delete role error:', error);
      return responseUtils.badRequest(res, error.message);
    }
  },

  // Hard delete role
  permanentDelete: async (req, res) => {
    try {
      const deleted = await roleService.hardDelete(req.params.roleid);
      if (!deleted) {
        return responseUtils.notFound(res, 'Role not found for permanent delete');
      }
      return responseUtils.ok(res, {
        message: 'Role permanently deleted'
      });
    } catch (error) {
      console.error('Hard delete role error:', error);
      return responseUtils.badRequest(res, error.message);
    }
  },

  // Restore role from soft delete
  restore: async (req, res) => {
    try {
      const restored = await roleService.restore(req.params.roleid);
      if (!restored) {
        return responseUtils.notFound(res, 'Role not found to restore');
      }
      return responseUtils.ok(res, {
        message: 'Role restored successfully'
      });
    } catch (error) {
      console.error('Restore role error:', error);
      return responseUtils.badRequest(res, error.message);
    }
  }
};

module.exports = roleController;
