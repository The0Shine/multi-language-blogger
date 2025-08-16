const { Op, Sequelize } = require("sequelize");
const fullTextSearchUtils = require("./fullTextSearchUtils");

const queryUtils = {
  /**
   * Build search query with Full-Text Search support
   * Falls back to LIKE search if Full-Text Search is not available
   */
  buildSearchQuery: (searchTerm, fields, useFullText = true) => {
    if (!searchTerm || !fields || fields.length === 0) {
      return {};
    }

    const cleanSearchTerm = searchTerm.trim();

    // Use Full-Text Search if enabled and available
    if (useFullText && fields.includes("title") && fields.includes("content")) {
      try {
        const fullTextQuery = fullTextSearchUtils.buildAdvancedSearch(
          cleanSearchTerm,
          {
            fields: ["title", "content"],
            mode: "NATURAL",
            minRelevance: 0.1,
            fallbackToLike: true,
            boostTitle: true,
          }
        );

        return fullTextQuery.where;
      } catch (error) {
        console.warn(
          "Full-Text Search not available, falling back to LIKE search:",
          error.message
        );
      }
    }

    // Fallback to LIKE search
    const searchConditions = fields.map((field) => ({
      [field]: {
        [Op.like]: `%${cleanSearchTerm}%`,
      },
    }));

    return {
      [Op.or]: searchConditions,
    };
  },

  /**
   * Build Full-Text Search query with relevance scoring
   */
  buildFullTextSearchQuery: (searchTerm, options = {}) => {
    try {
      console.log("🔧 Building Full-Text Search query for:", searchTerm);
      const result = fullTextSearchUtils.buildAdvancedSearch(
        searchTerm,
        options
      );

      console.log("🔧 Full-Text Search result:", {
        hasWhere: !!result.where,
        whereKeys: result.where ? Object.keys(result.where) : [],
        hasAttributes: !!result.attributes,
        hasOrder: !!result.order,
      });

      // Ensure result has proper structure
      const finalResult = {
        where: result.where || {},
        attributes: result.attributes || {},
        order: result.order || [],
      };

      console.log("🔧 Final query result:", {
        hasWhere: !!finalResult.where,
        whereKeys: finalResult.where ? Object.keys(finalResult.where) : [],
        whereSymbols: finalResult.where
          ? Object.getOwnPropertySymbols(finalResult.where).map((s) =>
              s.toString()
            )
          : [],
        hasOpAnd: finalResult.where && finalResult.where[Op.and],
        whereContent:
          finalResult.where && finalResult.where[Op.and]
            ? "Has Op.and condition"
            : "No Op.and condition",
      });

      return finalResult;
    } catch (error) {
      console.error("❌ Full-Text Search query error:", error);

      // Fallback to LIKE search
      const cleanSearchTerm = searchTerm.trim();
      const fields = options.fields || ["title", "content"];
      const likeConditions = fields.map((field) => ({
        [field]: { [Op.like]: `%${cleanSearchTerm}%` },
      }));

      console.log("⚠️ Falling back to LIKE search");
      return {
        where: { [Op.or]: likeConditions },
        attributes: {},
        order: [],
      };
    }
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
