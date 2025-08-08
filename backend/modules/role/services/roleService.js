const { Role, User, Sequelize } = require('models');
const { Op } = Sequelize;

const roleService = {
  create: async (data) => {
    const name = String(data.name || '').trim();
    if (!name) throw new Error('name is required');

    const existed = await Role.findOne({ where: { name, deleted_at: null } });
    if (existed) throw new Error('Role name already exists');

    return Role.create({
      name,
      discription: data.discription ?? null,
      status: Number(data.status) === 0 ? 0 : 1
    });
  },

  getAll: async ({ onlyActive = false } = {}) => {
    const where = {};
    if (onlyActive) {
      where.status = 1;
      where.deleted_at = null;
    }
    return Role.findAll({
      attributes: ['roleid', 'name', 'status', 'discription', 'created_at', 'updated_at', 'deleted_at'],
      where,
      order: [['name', 'ASC']]
    });
  },

  getById: async (roleid) => {
    return Role.findByPk(roleid);
  },

  update: async (roleid, updateData) => {
    const role = await Role.findByPk(roleid);
    if (!role) return null;

    if (updateData.name && updateData.name !== role.name) {
      const dup = await Role.findOne({
        where: { name: updateData.name, roleid: { [Op.ne]: roleid }, deleted_at: null }
      });
      if (dup) throw new Error('Role name already exists');
      role.name = updateData.name.trim();
    }

    if (updateData.discription !== undefined) {
      role.discription = updateData.discription ?? null;
    }

    if (updateData.status !== undefined) {
      role.status = Number(updateData.status) === 0 ? 0 : 1;
    }

    role.updated_at = new Date();
    await role.save();

    return role;
  },

  softDelete: async (roleid) => {
    const role = await Role.findByPk(roleid);
    if (!role) return false;

    const inUse = await User.count({ where: { roleid, deleted_at: null } });
    if (inUse > 0) throw new Error('Cannot delete role that is assigned to users');

    role.status = 0;
    role.deleted_at = new Date();
    role.updated_at = new Date();
    await role.save();

    return true;
  },

  hardDelete: async (roleid) => {
    const role = await Role.findByPk(roleid);
    if (!role) return false;

    const inUse = await User.count({ where: { roleid, deleted_at: null } });
    if (inUse > 0) throw new Error('Cannot hard-delete role that is assigned to users');

    await role.destroy({ force: true });
    return true;
  },

  restore: async (roleid) => {
    const role = await Role.findByPk(roleid);
    if (!role) return false;

    role.status = 1;
    role.deleted_at = null;
    role.updated_at = new Date();
    await role.save();

    return true;
  }
};

module.exports = roleService;
