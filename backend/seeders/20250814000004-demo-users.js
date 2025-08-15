'use strict';
const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Hash passwords
    const adminPassword = await bcrypt.hash('admin123', 10);
    const userPassword = await bcrypt.hash('user123', 10);
    const testPassword = await bcrypt.hash('test123', 10);

    await queryInterface.bulkInsert('user', [
      {
        userid: 1,
        roleid: 2, // Admin role
        first_name: 'Admin',
        last_name: 'User',
        email: 'admin@example.com',
        username: 'admin',
        password: adminPassword,
        status: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        userid: 2,
        roleid: 1, // User role
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        username: 'johndoe',
        password: userPassword,
        status: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        userid: 3,
        roleid: 1, // User role
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'jane.smith@example.com',
        username: 'janesmith',
        password: testPassword,
        status: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        userid: 4,
        roleid: 1, // User role
        first_name: 'Test',
        last_name: 'User',
        email: 'test@example.com',
        username: 'testuser',
        password: testPassword,
        status: 1,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('user', null, {});
  }
};
