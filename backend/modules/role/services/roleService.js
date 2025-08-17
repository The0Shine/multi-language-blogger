const { Role, User, Sequelize,Permission } = require('models');
const { Op } = Sequelize;

const roleService = {
  create: async (data) => {
    const name = String(data.name || '').trim();
    if (!name) throw new Error('name is required');

    const existed = await Role.findOne({ where: { name, deleted_at: null } });
    if (existed) throw new Error('Role name already exists');

    // 1. Tạo role
    const role = await Role.create({
      name,
      discription: data.discription ?? null,
      status: Number(data.status) === 0 ? 0 : 1
    });

    // 2. Nếu có permissionid thì gán
    if (data.permissionid && Array.isArray(data.permissionid)) {
      // validate permission tồn tại
      const perms = await Permission.findAll({
        where: { permissionid: data.permissionid }
      });

      if (perms.length !== data.permissionid.length) {
        throw new Error("Some permissionid not found");
      }

      // gán quan hệ -> Sequelize tự insert vào role_permission
      await role.setPermissions(perms);
    }

    // 3. Trả về role kèm permissions
    return Role.findByPk(role.roleid, {
      include: [{ model: Permission, as: 'permissions' }]
    });
  },

 getAll: async ({ onlyActive = false } = {}) => {
  const where = {};
  if (onlyActive) {
    where.status = 1;
    where.deleted_at = null;
  }
  return Role.findAll({
    where,
    // THÊM ĐOẠN NÀY VÀO
    include: [{
      model: Permission,
      as: 'permissions',
      through: { attributes: [] } // Dòng này để không lấy dữ liệu thừa từ bảng trung gian
    }],
    order: [['name', 'ASC']]
  });
},

getById: async (roleid) => {
  return Role.findByPk(roleid, {
    // THÊM INCLUDE VÀO ĐÂY
    include: [{
      model: Permission,
      as: 'permissions',
      through: { attributes: [] }
    }]
  });
},

 update: async (roleid, updateData) => {
  const role = await Role.findByPk(roleid, {
    include: [{ model: Permission, as: 'permissions' }]
  });
  if (!role) return null;

  // check name duplicate
  if (updateData.name && updateData.name !== role.name) {
    const dup = await Role.findOne({
      where: { 
        name: updateData.name, 
        roleid: { [Op.ne]: roleid }, 
        deleted_at: null 
      }
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

  // ✅ cập nhật permission nếu có gửi lên
  if (updateData.permissionid && Array.isArray(updateData.permissionid)) {
    const perms = await Permission.findAll({
      where: { permissionid: updateData.permissionid }
    });

    if (perms.length !== updateData.permissionid.length) {
      throw new Error("Some permissionid not found");
    }

    await role.setPermissions(perms); // Sequelize sẽ sync lại role_permission
  }

  return Role.findByPk(roleid, {
    include: [{ model: Permission, as: 'permissions' }]
  });
}
,

  delete: async (roleid) => {
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

  permanentDelete: async (roleid) => {
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