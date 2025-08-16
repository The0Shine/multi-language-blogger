'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Update existing posts with status = -1 to status = 0 (pending)
    await queryInterface.sequelize.query(`
      UPDATE posts 
      SET status = 0, updated_at = NOW() 
      WHERE status = -1;
    `);

    // Update the default value for status column to 0
    await queryInterface.changeColumn('posts', 'status', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        isIn: [[-1, 0, 1]]
      }
    });
  },

  async down(queryInterface, Sequelize) {
    // Revert the default value back to -1
    await queryInterface.changeColumn('posts', 'status', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: -1,
      validate: {
        isIn: [[-1, 0, 1]]
      }
    });

    // Revert posts with status = 0 back to status = -1
    await queryInterface.sequelize.query(`
      UPDATE posts 
      SET status = -1, updated_at = NOW() 
      WHERE status = 0;
    `);
  }
};
