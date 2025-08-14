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
    Role.hasMany(models.User, { foreignKey: 'roleid' });
  };

  return Role;
};
