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
      return responseUtils.internalServerError(res, error.message);
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
      return responseUtils.internalServerError(res, error.message);
    }
  },

  // Get category by ID
  getById: async (req, res) => {
    try {
      const { categoryid } = req.params;

      const category = await categoryService.getById(categoryid);
      if (!category) {
        return responseUtils.notFound(res, 'Category not found');
      }

      return responseUtils.ok(res, {
        message: 'Category retrieved successfully',
        data: category
      });
    } catch (error) {
      console.error('Get category by ID error:', error);
      return responseUtils.internalServerError(res, error.message);
    }
  },

  // Update category
  update: async (req, res) => {
    try {
      const { categoryid } = req.params;

      const updatedCategory = await categoryService.update(categoryid, req.body);
      if (!updatedCategory) {
        return responseUtils.notFound(res, 'Category not found');
      }

      return responseUtils.ok(res, {
        message: 'Category updated successfully',
        data: updatedCategory
      });
    } catch (error) {
      console.error('Update category error:', error);
      return responseUtils.internalServerError(res, error.message);
    }
  },

  // Delete category
  delete: async (req, res) => {
    try {
      const { categoryid } = req.params;

      const deleted = await categoryService.delete(categoryid);
      if (!deleted) {
        return responseUtils.notFound(res, 'Category not found');
      }

      return responseUtils.ok(res, {
        message: 'Category deleted successfully'
      });
    } catch (error) {
      console.error('Delete category error:', error);
      return responseUtils.internalServerError(res, error.message);
    }
  },
    permanentDelete: async (req, res) => {
    try {
      const { categoryid } = req.params;
      const result = await categoryService.permanentDelete(categoryid);

      if (!result) {
        return responseUtils.notFound(res, 'Category not found for permanent delete');
      }

      return responseUtils.ok(res, {
        message: 'Category permanently deleted'
      });
    } catch (error) {
      console.error('Permanent delete category error:', error);
      return responseUtils.internalServerError(res, error.message);
    }
  }
};

module.exports = categoryController;
