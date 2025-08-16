const { Op, Sequelize } = require("sequelize");

/**
 * Full-Text Search utilities for MySQL
 * Provides advanced search capabilities with relevance scoring
 */
const fullTextSearchUtils = {
  /**
   * Build MySQL Full-Text Search query with relevance scoring
   * @param {string} searchTerm - The search term
   * @param {string[]} fields - Fields to search in (default: ['title', 'content'])
   * @param {string} mode - Search mode: 'NATURAL', 'BOOLEAN', 'QUERY_EXPANSION'
   * @returns {Object} - Sequelize query object with relevance scoring
   */
  buildFullTextQuery: (
    searchTerm,
    fields = ["title", "content"],
    mode = "NATURAL"
  ) => {
    if (!searchTerm || searchTerm.trim() === "") {
      return {};
    }

    const cleanSearchTerm = searchTerm.trim().replace(/'/g, "''"); // Escape single quotes
    const fieldsStr = fields.join(", ");

    // Build the MATCH AGAINST clause based on mode
    let matchClause;
    switch (mode.toUpperCase()) {
      case "BOOLEAN":
        // Boolean mode allows +, -, ", *, etc.
        matchClause = `MATCH(${fieldsStr}) AGAINST('${cleanSearchTerm}' IN BOOLEAN MODE)`;
        break;
      case "QUERY_EXPANSION":
        // Query expansion finds related terms
        matchClause = `MATCH(${fieldsStr}) AGAINST('${cleanSearchTerm}' WITH QUERY EXPANSION)`;
        break;
      case "NATURAL":
      default:
        // Natural language mode (default)
        matchClause = `MATCH(${fieldsStr}) AGAINST('${cleanSearchTerm}' IN NATURAL LANGUAGE MODE)`;
        break;
    }

    return {
      where: Sequelize.literal(matchClause),
      relevanceScore: Sequelize.literal(`${matchClause} AS relevance_score`),
    };
  },

  /**
   * Build advanced search query with multiple modes
   * @param {string} searchTerm - The search term
   * @param {Object} options - Search options
   * @returns {Object} - Complete search configuration
   */
  buildAdvancedSearch: (searchTerm, options = {}) => {
    const {
      fields = ["title", "content"],
      mode = "NATURAL",
      minRelevance = 0.1,
      fallbackToLike = true,
      boostTitle = true,
    } = options;

    if (!searchTerm || searchTerm.trim() === "") {
      return { where: {}, attributes: {}, order: [] };
    }

    const cleanSearchTerm = searchTerm.trim().replace(/'/g, "''"); // Escape single quotes
    const fieldsStr = fields.join(", ");

    // Check if search term meets minimum word length (MySQL ft_min_word_len = 4)
    const words = cleanSearchTerm
      .split(/\s+/)
      .filter((word) => word.length >= 4);
    if (words.length === 0) {
      console.log("Search term too short for Full-Text, using LIKE fallback");
      // Fallback to LIKE search for short terms
      if (fallbackToLike) {
        const likeConditions = fields.map((field) => ({
          [field]: { [Op.like]: `%${cleanSearchTerm}%` },
        }));

        return {
          where: { [Op.or]: likeConditions },
          attributes: {},
          order: [],
        };
      }
      return { where: {}, attributes: {}, order: [] };
    }

    // Handle duplicate words - use unique words for better scoring
    const uniqueWords = [...new Set(words)];
    const processedSearchTerm = uniqueWords.join(" ");

    console.log(`🔍 Word processing:`, {
      original: cleanSearchTerm,
      words: words,
      uniqueWords: uniqueWords,
      processed: processedSearchTerm,
      hasDuplicates: words.length !== uniqueWords.length,
    });

    // Primary full-text search using processed term (without duplicates)
    let matchClause;
    switch (mode.toUpperCase()) {
      case "BOOLEAN":
        matchClause = `MATCH(${fieldsStr}) AGAINST('${processedSearchTerm}' IN BOOLEAN MODE)`;
        break;
      case "QUERY_EXPANSION":
        matchClause = `MATCH(${fieldsStr}) AGAINST('${processedSearchTerm}' WITH QUERY EXPANSION)`;
        break;
      case "NATURAL":
      default:
        matchClause = `MATCH(${fieldsStr}) AGAINST('${processedSearchTerm}' IN NATURAL LANGUAGE MODE)`;
        break;
    }

    // Build relevance scoring with title boost
    // Use original term for title matching to preserve user intent
    let relevanceClause = matchClause;
    if (boostTitle && fields.includes("title")) {
      // Check both original and processed terms for title boost
      const titleBoostConditions = [];

      // Boost for original search term
      titleBoostConditions.push(
        `CASE WHEN title LIKE '%${cleanSearchTerm}%' THEN 2.0 ELSE 0 END`
      );
      titleBoostConditions.push(
        `CASE WHEN title = '${cleanSearchTerm}' THEN 5.0 ELSE 0 END`
      );

      // If processed term is different, also boost for individual words
      if (processedSearchTerm !== cleanSearchTerm) {
        uniqueWords.forEach((word) => {
          titleBoostConditions.push(
            `CASE WHEN title LIKE '%${word}%' THEN 1.0 ELSE 0 END`
          );
        });
      }

      relevanceClause = `(${matchClause} + ${titleBoostConditions.join(
        " + "
      )})`;
    }

    // Build Full-Text Search config (no try-catch here since it's just object creation)
    const searchConfig = {
      where: {
        [Op.and]: [Sequelize.literal(`${matchClause} > ${minRelevance}`)],
      },
      attributes: {
        include: [[Sequelize.literal(relevanceClause), "relevance_score"]],
      },
      order: [[Sequelize.literal("relevance_score"), "DESC"]],
    };

    console.log("🔍 Full-Text Search config built:", {
      originalTerm: searchTerm,
      processedTerm: processedSearchTerm,
      matchClause: `${matchClause} > ${minRelevance}`,
      relevanceClause: relevanceClause.substring(0, 100) + "...",
      hasWhere: !!searchConfig.where,
      hasAttributes: !!searchConfig.attributes,
      hasOrder: !!searchConfig.order,
    });

    // Log the actual SQL components
    console.log("📊 SQL Components:");
    console.log(`   MATCH clause: ${matchClause}`);
    console.log(`   Relevance clause: ${relevanceClause}`);
    console.log(`   Min relevance: ${minRelevance}`);

    return searchConfig;
  },

  /**
   * Generate search summary from content
   * @param {string} content - Full content
   * @param {string} searchTerm - Search term to highlight
   * @param {number} maxLength - Maximum summary length
   * @returns {string} - Search summary with highlighted terms
   */
  generateSearchSummary: (content, searchTerm, maxLength = 200) => {
    if (!content || !searchTerm) return "";

    const cleanContent = content.replace(/<[^>]*>/g, ""); // Remove HTML tags
    const cleanSearchTerm = searchTerm.trim().toLowerCase();
    const contentLower = cleanContent.toLowerCase();

    // Find the position of the search term
    const termPosition = contentLower.indexOf(cleanSearchTerm);

    if (termPosition === -1) {
      // If term not found, return beginning of content
      return (
        cleanContent.substring(0, maxLength) +
        (cleanContent.length > maxLength ? "..." : "")
      );
    }

    // Calculate start position to center the search term
    const startPos = Math.max(0, termPosition - Math.floor(maxLength / 2));
    const endPos = Math.min(cleanContent.length, startPos + maxLength);

    let summary = cleanContent.substring(startPos, endPos);

    // Add ellipsis if needed
    if (startPos > 0) summary = "..." + summary;
    if (endPos < cleanContent.length) summary = summary + "...";

    return summary;
  },

  /**
   * Prepare search term for different modes
   * @param {string} searchTerm - Raw search term
   * @param {string} mode - Search mode
   * @returns {string} - Prepared search term
   */
  prepareSearchTerm: (searchTerm, mode = "NATURAL") => {
    if (!searchTerm) return "";

    const cleanTerm = searchTerm.trim();

    switch (mode.toUpperCase()) {
      case "BOOLEAN":
        // For boolean mode, add + to require all terms
        return cleanTerm
          .split(" ")
          .map((term) => `+${term}`)
          .join(" ");
      case "PHRASE":
        // For exact phrase search
        return `"${cleanTerm}"`;
      case "WILDCARD":
        // For wildcard search
        return cleanTerm
          .split(" ")
          .map((term) => `${term}*`)
          .join(" ");
      case "NATURAL":
      default:
        return cleanTerm;
    }
  },

  /**
   * Build search suggestions based on partial matches
   * @param {string} partialTerm - Partial search term
   * @param {Object} sequelize - Sequelize instance
   * @returns {Promise<string[]>} - Array of suggestions
   */
  buildSearchSuggestions: async (partialTerm, sequelize) => {
    if (!partialTerm || partialTerm.length < 2) return [];

    try {
      const suggestions = await sequelize.query(
        `
        SELECT DISTINCT 
          SUBSTRING_INDEX(
            SUBSTRING_INDEX(title, ' ', numbers.n), 
            ' ', -1
          ) as suggestion
        FROM post
        CROSS JOIN (
          SELECT 1 n UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5
        ) numbers
        WHERE CHAR_LENGTH(title) - CHAR_LENGTH(REPLACE(title, ' ', '')) >= numbers.n - 1
          AND SUBSTRING_INDEX(SUBSTRING_INDEX(title, ' ', numbers.n), ' ', -1) LIKE '${partialTerm}%'
          AND status = 1
        ORDER BY suggestion
        LIMIT 10
      `,
        { type: sequelize.QueryTypes.SELECT }
      );

      return suggestions
        .map((row) => row.suggestion)
        .filter((s) => s && s.length > 2);
    } catch (error) {
      console.error("Error generating search suggestions:", error);
      return [];
    }
  },
};

module.exports = fullTextSearchUtils;
