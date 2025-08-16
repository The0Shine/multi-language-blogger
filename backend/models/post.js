module.exports = (sequelize, DataTypes) => {
  const Post = sequelize.define(
    "Post",
    {
      postid: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userid: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      languageid: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      originalid: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      search_summary: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: "Auto-generated search summary for better search results",
      },
      status: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0, // Default to pending status (0 = pending, 1 = approved, -1 = rejected)
        validate: {
          isIn: [[-1, 0, 1]],
        },
      },
    },
    {
      sequelize,
      modelName: "Post",
      tableName: "post",
      timestamps: true,
      paranoid: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      deletedAt: "deleted_at",
      indexes: [
        {
          fields: ["userid"],
        },
        {
          fields: ["languageid"],
        },
        {
          fields: ["originalid"],
        },
        {
          fields: ["status"],
        },
        {
          fields: ["created_at"],
        },
        {
          fields: ["title"],
        },
      ],
      scopes: {
        approved: {
          where: { status: 1 },
        },
        pending: {
          where: { status: 0 },
        },
        rejected: {
          where: { status: -1 },
        },
        withAuthor: {
          include: [
            {
              association: "author",
              attributes: ["userid", "first_name", "last_name", "username"],
            },
          ],
        },
        withCategories: {
          include: [
            {
              association: "categories",
              attributes: ["categoryid", "category_name"],
              through: { attributes: [] },
            },
          ],
        },
        full: {
          include: [
            {
              association: "author",
              attributes: ["userid", "first_name", "last_name", "username"],
            },
            {
              association: "language",
              attributes: ["languageid", "language_name", "locale_code"],
            },
            {
              association: "categories",
              attributes: ["categoryid", "category_name"],
              through: { attributes: [] },
            },
          ],
        },
      },
    }
  );

  Post.associate = function (models) {
    // Liên kết với user
    Post.belongsTo(models.User, { foreignKey: "userid", as: "author" });

    // Liên kết với language
    Post.belongsTo(models.Language, {
      foreignKey: "languageid",
      as: "language",
    });

    // Bản gốc (nếu có)
    Post.belongsTo(models.Post, {
      foreignKey: "originalid",
      as: "original",
    });

    // Các bản dịch của post này
    Post.hasMany(models.Post, {
      foreignKey: "originalid",
      as: "translations",
    });

    // Comments
    Post.hasMany(models.Comment, { foreignKey: "postid", as: "comments" });

    // Categories
    Post.belongsToMany(models.Category, {
      through: models.CategoryPost,
      foreignKey: "postid",
      otherKey: "categoryid",
      as: "categories",
    });
  };

  return Post;
};
