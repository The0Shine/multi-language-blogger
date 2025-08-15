const { Op } = require("sequelize");

const queryUtils = {
  buildSearchQuery: (searchTerm, fields) => {
    if (!searchTerm || !fields || fields.length === 0) {
      return {};
    }

    const searchConditions = fields.map((field) => ({
      [field]: {
        [Op.like]: `%${searchTerm}%`,
      },
    }));

    return {
      [Op.or]: searchConditions,
    };
  },

  buildSortQuery: (sortBy, sortOrder = "ASC") => {
    if (!sortBy) {
      return [["created_at", "DESC"]];
    }

    const validSortOrders = ["ASC", "DESC"];
    const order = validSortOrders.includes(sortOrder.toUpperCase())
      ? sortOrder.toUpperCase()
      : "ASC";

    return [[sortBy, order]];
  },

  buildFilterQuery: (filters) => {
    const whereClause = {};

    Object.keys(filters).forEach((key) => {
      const value = filters[key];
      if (value !== undefined && value !== null && value !== "") {
        if (Array.isArray(value)) {
          whereClause[key] = { [Op.in]: value };
        } else {
          whereClause[key] = value;
        }
      }
    });

    return whereClause;
  },

  buildDateRangeQuery: (startDate, endDate, field = "created_at") => {
    const dateQuery = {};

    if (startDate || endDate) {
      dateQuery[field] = {};

      if (startDate) {
        dateQuery[field][Op.gte] = new Date(startDate);
      }

      if (endDate) {
        dateQuery[field][Op.lte] = new Date(endDate);
      }
    }

    return dateQuery;
  },
};

module.exports = queryUtils;
