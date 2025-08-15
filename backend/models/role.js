'use strict';
module.exports = (sequelize, DataTypes) => {
  const Role = sequelize.define('Role', {
    roleid: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: DataTypes.STRING,
    status: DataTypes.INTEGER,
    discription: DataTypes.STRING
  }, {
    tableName: 'role',
    timestamps: true,
    underscored: true,
    paranoid: true
  });

  Role.associate = function(models) {
    // 1-n: Role -> User
    Role.hasMany(models.User, { foreignKey: 'roleid' });

    // n-n: Role -> Permission
    Role.belongsToMany(models.Permission, {
      through: 'role_permission',
      foreignKey: 'roleid',
      otherKey: 'permissionid',
      as: 'permissions'
    });
  };

  return Role;
};