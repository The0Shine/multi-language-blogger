// backend/modules/category/services/categoryService.js
const { Category } = require('models');

const categoryService = {
  // Create a new category
  create: async (data) => {
    try {
      // (tuỳ chọn) loại bỏ các field nhạy cảm nếu FE gửi lên
      const { categoryid, created_at, updated_at, deleted_at, ...clean } = data;
      const newCategory = await Category.create(clean);
      return newCategory;
    } catch (error) {
      console.error('Create category error:', error);
      throw new Error('Failed to create category');
    }
  },

  // Get all categories
  getAll: async () => {
    try {
      return await Category.findAll({
        order: [['created_at', 'DESC']],
      });
    } catch (error) {
      console.error('Get all categories error:', error);
      throw new Error('Failed to retrieve categories');
    }
  },

  // Get category by ID
  getById: async (categoryid) => {
    try {
      const id = Number(categoryid);
      const category = await Category.findByPk(id);
      if (!category) throw new Error('Category not found');
      return category;
    } catch (error) {
      console.error('Get category by ID error:', error);
      throw error;
    }
  },

  // Update category
  update: async (categoryid, updateData) => {
    try {
      const id = Number(categoryid);
      const category = await Category.findByPk(id);
      if (!category) throw new Error('Category not found');

      // Sanitize input
      const { categoryid: _id, created_at, updated_at, deleted_at, ...clean } = updateData;

      await category.update(clean);
      return category;
    } catch (error) {
      console.error('Update category error:', error);
      throw error;
    }
  },

  // Delete category (sẽ cascade category_post nhờ FK onDelete: 'CASCADE')
  delete: async (categoryid) => {
    try {
      const id = Number(categoryid);
      const category = await Category.findByPk(id);
      if (!category) throw new Error('Category not found');

      await category.destroy(); // nếu model có paranoid=true sẽ là soft delete
      return { message: 'Category deleted successfully' };
    } catch (error) {
      console.error('Delete category error:', error);
      throw error;
    }
  },

  // Hard delete (bỏ qua paranoid)
  permanentDelete: async (categoryid) => {
    try {
      const id = Number(categoryid);
      const result = await Category.destroy({ where: { categoryid: id }, force: true });
      return result > 0;
    } catch (error) {
      console.error('Permanent delete category error:', error);
      throw error;
    }
  },
};

module.exports = categoryService;
