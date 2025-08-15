module.exports = (sequelize, DataTypes) => {
  const Comment = sequelize.define(
    "Comment",
    {
      commentid: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      postid: DataTypes.INTEGER,
      author: DataTypes.STRING,
      content: DataTypes.TEXT,
      left: DataTypes.INTEGER,
      right: DataTypes.INTEGER,
    },
    {
      tableName: "comment",
      timestamps: true,
      underscored: true,
    }
  );

  Comment.associate = function (models) {
    Comment.belongsTo(models.Post, { foreignKey: "postid", as: "post" });
  };

  return Comment;
};
