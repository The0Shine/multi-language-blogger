'use strict';
module.exports = (sequelize, DataTypes) => {
  const Permission = sequelize.define('Permission', {
    permissionid: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    description: {
      type: DataTypes.TEXT
    }
  }, {
    tableName: 'permission',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at'
  });

  Permission.associate = function(models) {
    Permission.belongsToMany(models.Role, {
      through: 'role_permission',
      foreignKey: 'permissionid',
      otherKey: 'roleid',
      as: 'roles'
    });
  };

  return Permission;
};