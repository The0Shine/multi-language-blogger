'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // First, add the content column if it doesn't exist
      const tableDescription = await queryInterface.describeTable('post');
      
      if (!tableDescription.content) {
        await queryInterface.addColumn('post', 'content', {
          type: Sequelize.TEXT,
          allowNull: true,
        });
        console.log('✅ Added content column to post table');
      }

      // Add full-text search index on title and content
      await queryInterface.sequelize.query(`
        ALTER TABLE post 
        ADD FULLTEXT INDEX ft_search_idx (title, content)
      `);
      
      console.log('✅ Added full-text search index to post table');

      // Add search summary column for better search results display
      await queryInterface.addColumn('post', 'search_summary', {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Auto-generated search summary for better search results'
      });

      console.log('✅ Added search_summary column to post table');

    } catch (error) {
      console.error('❌ Migration error:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      // Remove full-text index
      await queryInterface.sequelize.query(`
        ALTER TABLE post 
        DROP INDEX ft_search_idx
      `);

      // Remove search_summary column
      await queryInterface.removeColumn('post', 'search_summary');

      console.log('✅ Removed full-text search index and search_summary column');
    } catch (error) {
      console.error('❌ Rollback error:', error);
      throw error;
    }
  },
};
