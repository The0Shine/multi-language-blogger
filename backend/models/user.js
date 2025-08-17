"use strict";
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      userid: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      roleid: DataTypes.INTEGER,
      first_name: DataTypes.STRING,
      last_name: DataTypes.STRING,
      email: DataTypes.STRING,
      username: DataTypes.STRING,
      password: DataTypes.STRING,
      status: DataTypes.INTEGER,
      extra_info: DataTypes.STRING,
    },
    {
      tableName: "user",
      timestamps: true,
      underscored: true,
      paranoid: true, // Enable soft deletes
    }
  );

  User.associate = function (models) {
    User.belongsTo(models.Role, { foreignKey: "roleid", as: "role" });
    User.hasMany(models.Post, { foreignKey: "userid", as: "posts" });
  };

  return User;
};
