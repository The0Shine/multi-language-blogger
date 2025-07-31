'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('comment', {
      commentid: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      postid: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'post',
          key: 'postid',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      author: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      left: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      right: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('comment');
  },
}; 