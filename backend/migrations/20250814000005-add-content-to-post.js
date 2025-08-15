'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('post', 'content', {
      type: Sequelize.TEXT,
      allowNull: true,
      after: 'title'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('post', 'content');
  }
};
