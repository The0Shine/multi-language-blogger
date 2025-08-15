// backend/modules/role/controllers/rolePermissionController.js
const responseUtils = require('utils/responseUtils');
const rpService = require('modules/role/services/rolePermissionService');

const rpController = {
  addPermissions: async (req, res) => {
    try {
      const roleid = Number(req.params.roleid);
      const permissionIds = req.body.permissionIds;

      const data = await rpService.addPermissions(roleid, permissionIds);
      return responseUtils.ok(res, {
        message: 'Permissions added successfully',
        data
      });
    } catch (err) {
      console.error('Add permissions error:', err);
      // Nếu là lỗi validation business → 400
      return responseUtils.badRequest(res, err.message || 'Failed to add permissions');
    }
  },

  removePermissions: async (req, res) => {
    try {
      const roleid = Number(req.params.roleid);
      const permissionIds = req.body.permissionIds;

      const data = await rpService.removePermissions(roleid, permissionIds);
      return responseUtils.ok(res, {
        message: 'Permissions removed successfully',
        data
      });
    } catch (err) {
      console.error('Remove permissions error:', err);
      return responseUtils.badRequest(res, err.message || 'Failed to remove permissions');
    }
  },
    list: async (req, res) => {
    try {
      const rows = await Permission.findAll({
        attributes: ['permissionid', 'name', 'description']
      });
      return responseUtils.ok(res, rows);
    } catch (err) {
      console.error('List permissions error:', err);
      return responseUtils.serverError(res, err.message || 'Failed to list permissions');
    }
  },
};

module.exports = rpController;