const { Language, Post, Sequelize } = require('models');
const { Op } = Sequelize;

const languageService = {
  // Create a new language
  create: async (data) => {
    const name = String(data.language_name || '').trim();
    const code = String(data.locale_code || '').trim();

    if (!name) throw new Error('language_name is required');
    if (!code) throw new Error('locale_code is required');

    // Uniqueness checks (adjust if you have unique indexes)
    const dupCode = await Language.findOne({ where: { locale_code: code, deleted_at: null } });
    if (dupCode) throw new Error('locale_code already exists');

    const dupName = await Language.findOne({ where: { language_name: name, deleted_at: null } });
    if (dupName) throw new Error('language_name already exists');

    const status = Number(data.status) === 0 ? 0 : 1;

    return Language.create({
      language_name: name,
      locale_code: code,
      status,
    });
  },

  // List languages
  getAll: async ({ onlyActive = false } = {}) => {
    const where = {};
    if (onlyActive) {
      where.status = 1;
      where.deleted_at = null;
    }
    return Language.findAll({
      attributes: ['languageid', 'language_name', 'locale_code', 'status', 'created_at', 'updated_at', 'deleted_at'],
      where,
      order: [['language_name', 'ASC']],
    });
  },

  // Get by id
  getById: async (languageid) => {
    const id = Number(languageid);
    return Language.findByPk(id);
  },

  // Update language
  update: async (languageid, payload) => {
    const id = Number(languageid);
    const lang = await Language.findByPk(id);
    if (!lang) return null;

    // Duplicate checks if fields are changing
    if (payload.locale_code && payload.locale_code !== lang.locale_code) {
      const dup = await Language.findOne({
        where: { locale_code: payload.locale_code, languageid: { [Op.ne]: id }, deleted_at: null }
      });
      if (dup) throw new Error('locale_code already exists');
      lang.locale_code = payload.locale_code.trim();
    }
    if (payload.language_name && payload.language_name !== lang.language_name) {
      const dup = await Language.findOne({
        where: { language_name: payload.language_name, languageid: { [Op.ne]: id }, deleted_at: null }
      });
      if (dup) throw new Error('language_name already exists');
      lang.language_name = payload.language_name.trim();
    }
    if (payload.status !== undefined) {
      lang.status = Number(payload.status) === 0 ? 0 : 1;
    }

    lang.updated_at = new Date();
    await lang.save();
    return lang;
  },

  // Soft delete language
  softDelete: async (languageid) => {
    const id = Number(languageid);
    const lang = await Language.findByPk(id);
    if (!lang) return false;

    // Prevent delete if in use by posts (not soft-deleted)
    const inUse = await Post.count({ where: { languageid: id, deleted_at: null } });
    if (inUse > 0) throw new Error('Cannot delete language that is used by posts');

    lang.status = 0;
    lang.deleted_at = new Date();
    lang.updated_at = new Date();
    await lang.save();
    return true;
  },

  // Hard delete language
  hardDelete: async (languageid) => {
    const id = Number(languageid);
    const lang = await Language.findByPk(id);
    if (!lang) return false;

    const inUse = await Post.count({ where: { languageid: id, deleted_at: null } });
    if (inUse > 0) throw new Error('Cannot hard-delete language that is used by posts');

    await lang.destroy({ force: true });
    return true;
  },

  // Restore language
  restore: async (languageid) => {
    const id = Number(languageid);
    const lang = await Language.findByPk(id);
    if (!lang) return false;

    lang.status = 1;
    lang.deleted_at = null;
    lang.updated_at = new Date();
    await lang.save();
    return true;
  },
};

module.exports = languageService;
