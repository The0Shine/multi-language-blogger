'use strict';
module.exports = (sequelize, DataTypes) => {
  const Language = sequelize.define('Language', {
    languageid: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    language_name: DataTypes.STRING,
    locale_code: DataTypes.STRING,
    status: DataTypes.INTEGER
  }, {
    tableName: 'language',
    timestamps: true,
    underscored: true,
    paranoid: true
  });

  Language.associate = function(models) {
    Language.hasMany(models.Post, { foreignKey: 'languageid' });
  };

  return Language;
};
