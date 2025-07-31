const { Category, sequelize } = require('models');

const categoryService = {
  // Create a new category
  create: async (data) => {
    const transaction = await sequelize.transaction();
    try {
      const newCategory = await Category.create(data, { transaction });
      await transaction.commit();
      return newCategory;
    } catch (error) {
      await transaction.rollback();
      console.error('Create category error:', error);
      throw new Error('Failed to create category');
    }
  },

  // Get all categories
  getAll: async () => {
    try {
      const categories = await Category.findAll({
        order: [['created_at', 'DESC']]
      });
      return categories;
    } catch (error) {
      console.error('Get all categories error:', error);
      throw new Error('Failed to retrieve categories');
    }
  },

  // Get category by ID
  getById: async (categoryid) => {
    try {
      const category = await Category.findByPk(categoryid);
      if (!category) {
        throw new Error('Category not found');
      }
      return category;
    } catch (error) {
      console.error('Get category by ID error:', error);
      throw error;
    }
  },

  // Update category
  update: async (categoryid, updateData) => {
    try {
      const category = await Category.findByPk(categoryid);
      if (!category) {
        throw new Error('Category not found');
      }

      // Sanitize input
      delete updateData.categoryid;
      delete updateData.created_at;
      delete updateData.updated_at;

      await category.update(updateData);

      // Return updated category
      return category;
    } catch (error) {
      console.error('Update category error:', error);
      throw error;
    }
  },

  // Delete category
  delete: async (categoryid) => {
    try {
      const category = await Category.findByPk(categoryid);
      if (!category) {
        throw new Error('Category not found');
      }

      await category.destroy(); // Soft delete if model supports it

      return { message: 'Category deleted successfully' };
    } catch (error) {
      console.error('Delete category error:', error);
      throw error;
    }
  },

  permanentDelete: async (categoryid) => {
    const result = await Category.destroy({
      where: { categoryid }, 
      force: true     
    });
    return result > 0;
  }
};

module.exports = categoryService;
