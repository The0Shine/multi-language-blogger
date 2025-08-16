const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class CategoryPost extends Model {
    static associate(models) {
      // This is a junction table, no additional associations needed
      // The associations are handled by Post and Category models
    }
  }

  CategoryPost.init(
    {
      postid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "post",
          key: "postid",
        },
      },
      categoryid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "category",
          key: "categoryid",
        },
      },
    },
    {
      sequelize,
      modelName: "CategoryPost",
      tableName: "category_post",
      timestamps: false, // No created_at, updated_at columns
      indexes: [
        {
          unique: true,
          fields: ["postid", "categoryid"],
        },
      ],
    }
  );

  return CategoryPost;
};
