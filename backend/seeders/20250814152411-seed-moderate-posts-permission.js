'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    // Lấy hoặc tạo role moderator
    const [roles] = await queryInterface.sequelize.query(
      `SELECT roleid FROM role WHERE name = 'moderator' LIMIT 1;`
    );

    let moderatorRoleId;
    if (!roles.length) {
      await queryInterface.bulkInsert('role', [{
        name: 'moderator',
        status: 1,
        discription: 'Role to moderate posts',
        created_at: new Date(),
        updated_at: new Date()
      }], {});
      const [newRole] = await queryInterface.sequelize.query(
        `SELECT roleid FROM role WHERE name = 'moderator' LIMIT 1;`
      );
      moderatorRoleId = newRole[0].roleid;
    } else {
      moderatorRoleId = roles[0].roleid;
    }

    // Lấy permission moderate_posts
    const [permissions] = await queryInterface.sequelize.query(
      `SELECT permissionid FROM permission WHERE name = 'moderate_posts' LIMIT 1;`
    );

    if (!permissions.length) {
      throw new Error('Permission moderate_posts not found');
    }

    // Gán quyền cho moderator nếu chưa có
    const [existing] = await queryInterface.sequelize.query(
      `SELECT * FROM role_permission WHERE roleid = ${moderatorRoleId} AND permissionid = ${permissions[0].permissionid} LIMIT 1;`
    );

    if (!existing.length) {
      await queryInterface.bulkInsert('role_permission', [{
        roleid: moderatorRoleId,
        permissionid: permissions[0].permissionid,
        created_at: new Date(),
        updated_at: new Date()
      }], {});
    }
  },

  async down (queryInterface) {
    await queryInterface.bulkDelete('role_permission', null, {});
    await queryInterface.bulkDelete('role', { name: 'moderator' }, {});
  }
};
