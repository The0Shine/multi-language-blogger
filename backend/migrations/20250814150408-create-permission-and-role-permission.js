'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Tạo bảng permission
    await queryInterface.createTable('permission', {
      permissionid: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });

    // Tạo bảng role_permission (quan hệ n-n)
    await queryInterface.createTable('role_permission', {
      roleid: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'role',
          key: 'roleid'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      permissionid: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'permission',
          key: 'permissionid'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Khóa chính kép cho bảng role_permission
    await queryInterface.addConstraint('role_permission', {
      fields: ['roleid', 'permissionid'],
      type: 'primary key',
      name: 'pk_role_permission'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('role_permission');
    await queryInterface.dropTable('permission');
  }
};
