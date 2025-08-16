'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Thêm các ngôn ngữ mới: Tây Ban Nha, Trung Quốc, Đức
    await queryInterface.bulkInsert('language', [
      {
        languageid: 4,
        language_name: 'Spanish',
        locale_code: 'es',
        status: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        languageid: 5,
        language_name: 'Chinese (Simplified)',
        locale_code: 'zh-CN',
        status: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        languageid: 6,
        language_name: 'German',
        locale_code: 'de',
        status: 1,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    // Xóa các ngôn ngữ đã thêm
    await queryInterface.bulkDelete('language', {
      languageid: [4, 5, 6]
    }, {});
  }
};
