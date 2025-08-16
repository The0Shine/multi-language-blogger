'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Cập nhật tên ngôn ngữ Trung Quốc - bỏ chữ (Simplified)
    await queryInterface.bulkUpdate('language', 
      {
        language_name: 'Chinese',
        updated_at: new Date()
      },
      {
        languageid: 5
      }
    );
  },

  async down(queryInterface, Sequelize) {
    // Khôi phục tên cũ nếu cần
    await queryInterface.bulkUpdate('language', 
      {
        language_name: 'Chinese (Simplified)',
        updated_at: new Date()
      },
      {
        languageid: 5
      }
    );
  }
};
