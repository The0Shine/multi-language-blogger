// backend/modules/category/controllers/categoryController.js
const categoryService = require('modules/category/services/categoryService');
const responseUtils = require('utils/responseUtils');

const categoryController = {
  // Create new category
  create: async (req, res) => {
    try {
      const category = await categoryService.create(req.body);
      return responseUtils.ok(res, {
        message: 'Category created successfully',
        data: category
      });
    } catch (error) {
      console.error('Create category error:', error);
      // Lỗi nghiệp vụ từ service => 400
      return responseUtils.badRequest(res, error.message || 'Failed to create category');
    }
  },

  // Get all categories
  getAll: async (req, res) => {
    try {
      const categories = await categoryService.getAll();
      return responseUtils.ok(res, {
        message: 'Categories retrieved successfully',
        data: categories
      });
    } catch (error) {
      console.error('Get all categories error:', error);
      return responseUtils.serverError(res, error.message);
    }
  },

  // Get category by ID
  getById: async (req, res) => {
    try {
      const { categoryid } = req.params;
      const category = await categoryService.getById(categoryid); // service sẽ throw nếu không thấy
      return responseUtils.ok(res, {
        message: 'Category retrieved successfully',
        data: category
      });
    } catch (error) {
      console.error('Get category by ID error:', error);
      if (error.message === 'Category not found') {
        return responseUtils.notFound(res, error.message);
      }
      return responseUtils.serverError(res, error.message);
    }
  },

  // Update category
  update: async (req, res) => {
    try {
      const { categoryid } = req.params;
      const updatedCategory = await categoryService.update(categoryid, req.body); // service throw nếu không thấy
      return responseUtils.ok(res, {
        message: 'Category updated successfully',
        data: updatedCategory
      });
    } catch (error) {
      console.error('Update category error:', error);
      if (error.message === 'Category not found') {
        return responseUtils.notFound(res, error.message);
      }
      return responseUtils.badRequest(res, error.message || 'Failed to update category');
    }
  },

  // Delete category (cascade category_post nhờ FK)
  delete: async (req, res) => {
    try {
      const { categoryid } = req.params;
      const result = await categoryService.delete(categoryid); // service throw nếu không thấy
      return responseUtils.ok(res, {
        message: result.message || 'Category deleted successfully'
      });
    } catch (error) {
      console.error('Delete category error:', error);
      if (error.message === 'Category not found') {
        return responseUtils.notFound(res, error.message);
      }
      return responseUtils.serverError(res, error.message);
    }
  },

  // Hard delete
  permanentDelete: async (req, res) => {
    try {
      const { categoryid } = req.params;
      const ok = await categoryService.permanentDelete(categoryid);
      if (!ok) {
        return responseUtils.notFound(res, 'Category not found for permanent delete');
      }
      return responseUtils.ok(res, { message: 'Category permanently deleted' });
    } catch (error) {
      console.error('Permanent delete category error:', error);
      return responseUtils.serverError(res, error.message);
    }
  }
};

module.exports = categoryController;
