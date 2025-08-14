'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('role', [
      {
        name: 'User',
        status: 1,
        discription: 'Default role for new users',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Admin',
        status: 1,
        discription: 'Administrator role with full access',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('role', null, {});
  },
};
