const languageService = require('modules/language/services/languageService');
const responseUtils = require('utils/responseUtils');

const languageController = {
  // Create language
  create: async (req, res) => {
    try {
      const language = await languageService.create(req.body);
      return responseUtils.ok(res, {
        message: 'Language created successfully',
        data: language
      });
    } catch (error) {
      console.error('Create language error:', error);
      return responseUtils.badRequest(res, error.message || 'Failed to create language');
    }
  },

  // List languages (?onlyActive=1 optional)
  getAll: async (req, res) => {
    try {
      const onlyActive = String(req.query.onlyActive || '') === '1';
      const languages = await languageService.getAll({ onlyActive });
      return responseUtils.ok(res, {
        message: 'Languages retrieved successfully',
        data: languages
      });
    } catch (error) {
      console.error('Get languages error:', error);
      return responseUtils.serverError(res, error.message);
    }
  },

  // Get by id
  getById: async (req, res) => {
    try {
      const language = await languageService.getById(req.params.languageid);
      if (!language) return responseUtils.notFound(res, 'Language not found');
      return responseUtils.ok(res, {
        message: 'Language retrieved successfully',
        data: language
      });
    } catch (error) {
      console.error('Get language by id error:', error);
      return responseUtils.serverError(res, error.message);
    }
  },

  // Update
  update: async (req, res) => {
    try {
      const updated = await languageService.update(req.params.languageid, req.body);
      if (!updated) return responseUtils.notFound(res, 'Language not found');
      return responseUtils.ok(res, {
        message: 'Language updated successfully',
        data: updated
      });
    } catch (error) {
      console.error('Update language error:', error);
      return responseUtils.badRequest(res, error.message || 'Failed to update language');
    }
  },

  // Soft delete
  delete: async (req, res) => {
    try {
      const ok = await languageService.softDelete(req.params.languageid);
      if (!ok) return responseUtils.notFound(res, 'Language not found');
      return responseUtils.ok(res, { message: 'Language soft-deleted' });
    } catch (error) {
      console.error('Soft delete language error:', error);
      return responseUtils.badRequest(res, error.message);
    }
  },

  // Hard delete
  permanentDelete: async (req, res) => {
    try {
      const ok = await languageService.hardDelete(req.params.languageid);
      if (!ok) return responseUtils.notFound(res, 'Language not found for permanent delete');
      return responseUtils.ok(res, { message: 'Language permanently deleted' });
    } catch (error) {
      console.error('Hard delete language error:', error);
      return responseUtils.badRequest(res, error.message);
    }
  },

  // Restore
  restore: async (req, res) => {
    try {
      const ok = await languageService.restore(req.params.languageid);
      if (!ok) return responseUtils.notFound(res, 'Language not found to restore');
      return responseUtils.ok(res, { message: 'Language restored' });
    } catch (error) {
      console.error('Restore language error:', error);
      return responseUtils.badRequest(res, error.message);
    }
  },
};

module.exports = languageController;
