'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('post', {
      postid: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      userid: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'user',
          key: 'userid',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      languageid: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'language',
          key: 'languageid',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      originalid: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'post',
          key: 'postid',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      status: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
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
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });

    await queryInterface.sequelize.query(`
      ALTER TABLE post
      ADD CONSTRAINT status_check CHECK (status IN (-1, 0, 1));
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('post');
  },
};
