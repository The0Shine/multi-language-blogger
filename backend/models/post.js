'use strict';

module.exports = (sequelize, DataTypes) => {
  const Post = sequelize.define('Post', {
    postid: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userid: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    languageid: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    originalid: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        isIn: [[-1, 0, 1]]
      }
    },
  }, {
    tableName: 'post',
    timestamps: true,
    underscored: true,
    paranoid: true
  });

  Post.associate = function(models) {
    // Liên kết với user
    Post.belongsTo(models.User, { foreignKey: 'userid' });

    // Liên kết với language
    Post.belongsTo(models.Language, { foreignKey: 'languageid' });

    // Bản gốc (nếu có)
    Post.belongsTo(models.Post, {
      foreignKey: 'originalid',
      as: 'original',
    });

    // Các bản dịch của post này
    Post.hasMany(models.Post, {
      foreignKey: 'originalid',
      as: 'translations',
    });

    // Comments
    Post.hasMany(models.Comment, { foreignKey: 'postid' });

    // Categories
    Post.belongsToMany(models.Category, {
      through: 'category_post',
      foreignKey: 'postid',
      otherKey: 'categoryid'
    });

    // PostContent
    Post.hasMany(models.PostContent, {
      foreignKey: 'post_id',
      as: 'contents'
    });
  };

  return Post;
};
