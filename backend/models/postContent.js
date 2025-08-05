module.exports = (sequelize, DataTypes) => {
  const PostContent = sequelize.define('PostContent', {
    postId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'post_id'
    },
    type: {
      type: DataTypes.ENUM('text', 'image', 'video'),
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    url: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'post_contents',
    underscored: true,
  });

  PostContent.associate = function(models) {
    PostContent.belongsTo(models.Post, {
      foreignKey: 'post_id',
      as: 'post'
    });
  };

  return PostContent;
};
