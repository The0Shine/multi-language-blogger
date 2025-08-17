// backend/modules/role/services/rolePermissionService.js
const { sequelize, Role, Permission } = require('models');

const rpService = {
  addPermissions: async (roleid, permissionIds = []) => {
    return sequelize.transaction(async (t) => {
      const role = await Role.findByPk(roleid, { transaction: t });
      if (!role) throw new Error('Role not found');

      // unique + int
      const ids = [...new Set(permissionIds.map(Number))];

      const perms = await Permission.findAll({
        where: { permissionid: ids },
        transaction: t
      });

      // Kiểm tra thiếu permission
      const foundIds = perms.map(p => p.permissionid);
      const missing = ids.filter(id => !foundIds.includes(id));
      if (missing.length) {
        throw new Error(`Missing permissions: ${missing.join(', ')}`);
      }

      // Gán (idempotent)
      await role.addPermissions(perms, { transaction: t });

      // Trả về role + permissions hiện tại
      return Role.findByPk(roleid, {
        include: [{ model: Permission, as: 'permissions', attributes: ['permissionid', 'name', 'description'] }],
        transaction: t
      });
    });
  },

  removePermissions: async (roleid, permissionIds = []) => {
    return sequelize.transaction(async (t) => {
      const role = await Role.findByPk(roleid, { transaction: t });
      if (!role) throw new Error('Role not found');

      const ids = [...new Set(permissionIds.map(Number))];

      const perms = await Permission.findAll({
        where: { permissionid: ids },
        transaction: t
      });

      // Bỏ liên kết (nếu id không tồn tại thì remove cũng an toàn)
      if (perms.length) {
        await role.removePermissions(perms, { transaction: t });
      }

      return Role.findByPk(roleid, {
        include: [{ model: Permission, as: 'permissions', attributes: ['permissionid', 'name', 'description'] }],
        transaction: t
      });
    });
  }
};

module.exports = rpService;
