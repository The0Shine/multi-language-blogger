'use strict';
module.exports = (sequelize, DataTypes) => {
  const Post = sequelize.define('Post', {
    postid: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userid: DataTypes.INTEGER,
    languageid: DataTypes.INTEGER,
    originalid: DataTypes.INTEGER,
    title: DataTypes.STRING,
    status: DataTypes.INTEGER,
    content: DataTypes.STRING
  }, {
    tableName: 'post',
    timestamps: true,
    underscored: true,
    paranoid: true
  });

  Post.associate = function(models) {
    Post.belongsTo(models.User, { foreignKey: 'userid' });
    Post.belongsTo(models.Language, { foreignKey: 'languageid' });
    Post.hasMany(models.Comment, { foreignKey: 'postid' });
    Post.belongsToMany(models.Category, {
      through: 'category_post',
      foreignKey: 'postid',
      otherKey: 'categoryid'
    });
  };

  return Post;
};
