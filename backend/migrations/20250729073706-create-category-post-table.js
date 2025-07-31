'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('category_post', {
      postid: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: {
          model: 'post',
          key: 'postid',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      categoryid: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: {
          model: 'category',
          key: 'categoryid',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('category_post');
  },
}; 