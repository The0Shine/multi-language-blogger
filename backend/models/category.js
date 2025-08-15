"use strict";
module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define(
    "Category",
    {
      categoryid: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      category_name: DataTypes.STRING,
      status: DataTypes.INTEGER,
    },
    {
      tableName: "category",
      timestamps: true,
      underscored: true,
      paranoid: true,
    }
  );

  Category.associate = function (models) {
    Category.belongsToMany(models.Post, {
      through: models.CategoryPost,
      foreignKey: "categoryid",
      otherKey: "postid",
    });
  };

  return Category;
};
