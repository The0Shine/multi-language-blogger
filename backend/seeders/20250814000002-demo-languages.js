'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('language', [
      {
        languageid: 1,
        language_name: 'English',
        locale_code: 'en',
        status: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        languageid: 2,
        language_name: 'Vietnamese',
        locale_code: 'vi',
        status: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        languageid: 3,
        language_name: 'French',
        locale_code: 'fr',
        status: 1,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('language', null, {});
  }
};
