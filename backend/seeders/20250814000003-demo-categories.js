"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "category",
      [
        {
          categoryid: 1,
          category_name: "Technology",
          status: 1,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          categoryid: 2,
          category_name: "Lifestyle",
          status: 1,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          categoryid: 3,
          category_name: "Business",
          status: 1,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          categoryid: 4,
          category_name: "Education",
          status: 1,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("category", null, {});
  },
};
