const postService = require("../services/postService");
const responseUtils = require("utils/responseUtils");
const paginationUtils = require("utils/paginationUtils");
const queryUtils = require("utils/queryUtils");
const { Post } = require("models");
const { User, Language, Category } = require("models");
const { Op } = require("sequelize");

const postController = {
  // Admin: Get all posts (including pending/rejected) with associations
  getAllForAdmin: async (req, res) => {
    try {
      const { page, limit } = paginationUtils.getPaginationParams(req.query);
      const params = {
        ...req.query,
        page,
        limit,
        includeAllStatuses: true, // Flag to include all statuses
      };
      const result = await postService.getPostsForAdmin(params);

      return responseUtils.ok(
        res,
        result,
        "Admin posts retrieved successfully"
      );
    } catch (error) {
      console.error("Get admin posts error:", error);
      return responseUtils.error(
        res,
        "Failed to retrieve admin posts",
        error.message
      );
    }
  },

  // Public: Get published posts only
  index: async (req, res) => {
    try {
      const { page, limit } = paginationUtils.getPaginationParams(req.query);
      const params = { ...req.query, page, limit };
      const result = await postService.getPosts(params);

      return responseUtils.ok(res, result, "Posts retrieved successfully");
    } catch (error) {
      console.error("Get posts error:", error);
      return responseUtils.error(
        res,
        "Failed to retrieve posts",
        error.message
      );
    }
  },

  show: async (req, res) => {
    try {
      const { postid } = req.params;
      const post = await postService.getPostByIdWithComments(postid);

      return responseUtils.ok(res, { post }, "Post retrieved successfully");
    } catch (error) {
      console.error("Get post error:", error);
      if (error.message === "Post not found") {
        return responseUtils.notFound(res, error.message);
      }
      return responseUtils.error(res, "Failed to retrieve post", error.message);
    }
  },

  create: async (req, res) => {
    try {
      const userid = req.user.userid;
      const post = await postService.createPost(req.body, userid);

      return responseUtils.ok(res, { post }, "Post created successfully");
    } catch (error) {
      console.error("Create post error:", error);
      if (error.name === "SequelizeValidationError") {
        const validationErrors = error.errors.map((err) => ({
          field: err.path,
          message: err.message,
        }));
        return responseUtils.invalidated(
          res,
          validationErrors,
          "Validation failed"
        );
      }
      return responseUtils.error(res, "Failed to create post", error.message);
    }
  },

  // Get all translations of a post
  getTranslations: async (req, res) => {
    try {
      const { postid } = req.params;
      const result = await postService.getPostById(postid);

      return responseUtils.ok(
        res,
        {
          originalid: result.post.originalid || postid,
          translations: result.translations,
          total_languages: result.translations.length,
        },
        "Post translations retrieved successfully"
      );
    } catch (error) {
      console.error("Get translations error:", error);
      if (error.message === "Post not found") {
        return responseUtils.notFound(res, error.message);
      }
      return responseUtils.error(
        res,
        "Failed to retrieve translations",
        error.message
      );
    }
  },

  update: async (req, res) => {
    try {
      const { postid } = req.params;
      const userid = req.user.userid;

      // Check authorization first
      const existingPost = await Post.findByPk(postid);
      if (!existingPost) {
        return responseUtils.notFound(res, "Post not found");
      }

      if (existingPost.userid !== userid && req.user.role.name !== "admin") {
        return responseUtils.forbidden(
          res,
          "You can only update your own posts"
        );
      }

      const updatedPost = await postService.updatePost(
        postid,
        req.body,
        userid
      );

      return responseUtils.ok(
        res,
        { post: updatedPost },
        "Post updated successfully"
      );
    } catch (error) {
      console.error("Update post error:", error);
      if (error.name === "SequelizeValidationError") {
        const validationErrors = error.errors.map((err) => ({
          field: err.path,
          message: err.message,
        }));
        return responseUtils.invalidated(
          res,
          validationErrors,
          "Validation failed"
        );
      }
      if (error.message === "Post not found") {
        return responseUtils.notFound(res, error.message);
      }
      if (error.message === "Unauthorized to update this post") {
        return responseUtils.forbidden(res, error.message);
      }
      return responseUtils.error(res, "Failed to update post", error.message);
    }
  },

  destroy: async (req, res) => {
    try {
      const { postid } = req.params;
      const userid = req.user.userid;

      // Check authorization first
      const existingPost = await Post.findByPk(postid);
      if (!existingPost) {
        return responseUtils.notFound(res, "Post not found");
      }

      if (existingPost.userid !== userid && req.user.role.name !== "admin") {
        return responseUtils.forbidden(
          res,
          "You can only delete your own posts"
        );
      }

      await postService.deletePost(postid, userid);

      return responseUtils.ok(res, null, "Post deleted successfully");
    } catch (error) {
      console.error("Delete post error:", error);
      if (error.message === "Post not found") {
        return responseUtils.notFound(res, error.message);
      }
      if (error.message === "Unauthorized to delete this post") {
        return responseUtils.forbidden(res, error.message);
      }
      return responseUtils.error(res, "Failed to delete post", error.message);
    }
  },

  approve: async (req, res) => {
    try {
      const { postid } = req.params;
      const updatedPost = await postService.approvePost(postid);

      return responseUtils.ok(
        res,
        { post: updatedPost },
        "Post approved successfully"
      );
    } catch (error) {
      console.error("Approve post error:", error);
      if (error.message === "Post not found") {
        return responseUtils.notFound(res, error.message);
      }
      if (error.message === "Post is already approved") {
        return responseUtils.badRequest(res, error.message);
      }
      return responseUtils.error(res, "Failed to approve post", error.message);
    }
  },

  reject: async (req, res) => {
    try {
      const { postid } = req.params;
      const updatedPost = await postService.rejectPost(postid);

      return responseUtils.ok(
        res,
        { post: updatedPost },
        "Post rejected successfully"
      );
    } catch (error) {
      console.error("Reject post error:", error);
      if (error.message === "Post not found") {
        return responseUtils.notFound(res, error.message);
      }
      if (error.message === "Post is already rejected") {
        return responseUtils.badRequest(res, error.message);
      }
      return responseUtils.error(res, "Failed to reject post", error.message);
    }
  },

  getMyPosts: async (req, res) => {
    try {
      const { page, limit } = paginationUtils.getPaginationParams(req.query);
      const userid = req.user.userid;
      const params = { ...req.query, page, limit };

      const result = await postService.getMyPosts(userid, params);

      return responseUtils.ok(res, result, "Your posts retrieved successfully");
    } catch (error) {
      console.error("Get my posts error:", error);
      return responseUtils.error(
        res,
        "Failed to retrieve your posts",
        error.message
      );
    }
  },

  search: async (req, res) => {
    try {
      const { page, limit, offset } = paginationUtils.getPaginationParams(
        req.query
      );
      const {
        search,
        categoryid,
        sortBy,
        sortOrder,
        startDate,
        endDate,
        languageid,
      } = req.query;

      if (!search || search.trim() === "") {
        return responseUtils.badRequest(res, "Search query is required");
      }

      console.log("🔍 Backend search params:", {
        search,
        categoryid,
        sortBy,
        sortOrder,
        startDate,
        endDate,
        languageid,
        page,
        limit,
      });

      console.log(`\n🎯 Search Analysis for: "${search}"`);
      console.log(`   Search term length: ${search.length} characters`);
      console.log(
        `   Words: ${search
          .split(/\s+/)
          .map((w) => `"${w}" (${w.length} chars)`)
          .join(", ")}`
      );
      console.log(`   Min relevance threshold: 0.5`);

      // Build Full-Text Search query with relevance scoring
      let searchQuery;
      try {
        searchQuery = queryUtils.buildFullTextSearchQuery(search.trim(), {
          fields: ["title", "content"],
          mode: "NATURAL",
          minRelevance: 0.1,
          fallbackToLike: true,
          boostTitle: true,
        });
        console.log("✅ Using Full-Text Search query");
      } catch (error) {
        console.error("❌ Search query build error:", error);
        // Fallback to simple LIKE search
        searchQuery = {
          where: queryUtils.buildSearchQuery(
            search.trim(),
            ["title", "content"],
            false
          ),
          attributes: {},
          order: [],
        };
        console.log("⚠️ Fallback to LIKE search");
      }

      // Log search query details
      console.log("\n🔧 Search Query Details:");
      console.log(
        "   Where clause:",
        JSON.stringify(searchQuery.where, null, 2)
      );
      console.log(
        "   Has relevance scoring:",
        !!(searchQuery.attributes && searchQuery.attributes.include)
      );
      console.log(
        "   Order by relevance:",
        !!(searchQuery.order && searchQuery.order.length > 0)
      );

      let whereClause = {
        status: 1, // Only search published posts (1 = published)
      };

      // Add search conditions if they exist
      // Check for Symbol keys (Op.and, Op.or) as well as regular keys
      const hasSearchConditions =
        searchQuery.where &&
        (Object.keys(searchQuery.where).length > 0 ||
          Object.getOwnPropertySymbols(searchQuery.where).length > 0);

      if (hasSearchConditions) {
        console.log("🔧 Merging search conditions with Symbol keys support");

        // Properly merge search conditions with existing where clause
        if (searchQuery.where[Op.and]) {
          // Full-Text Search with Op.and
          console.log("🔍 Found Op.and condition, merging...");
          whereClause[Op.and] = [...searchQuery.where[Op.and], { status: 1 }];
          // Remove status from top level since it's now in Op.and
          delete whereClause.status;
        } else if (searchQuery.where[Op.or]) {
          // LIKE Search with Op.or
          console.log("🔍 Found Op.or condition, merging...");
          whereClause[Op.and] = [searchQuery.where, { status: 1 }];
          delete whereClause.status;
        } else {
          // Other search conditions
          console.log("🔍 Found regular search conditions, merging...");
          whereClause = { ...whereClause, ...searchQuery.where };
        }
      } else {
        console.log("⚠️ No search conditions found");
      }

      // Language filter - search only in current language (no default)
      if (languageid) {
        const languageCondition = { languageid: languageid };

        if (whereClause[Op.and]) {
          // Add language filter to existing Op.and array
          whereClause[Op.and].push(languageCondition);
        } else {
          // Add language filter to top level
          whereClause.languageid = languageid;
        }

        console.log(`🌍 Filtering search by language: ${languageid}`);
      } else {
        console.log(`🌍 No language filter - searching all languages`);
      }

      // Category filter - add to main where clause for proper filtering
      if (categoryid) {
        console.log(`📂 Filtering search by category: ${categoryid}`);

        // Add category filter to where clause using association alias
        if (whereClause[Op.and]) {
          // Add to existing Op.and array
          whereClause[Op.and].push({
            "$categories.categoryid$": categoryid,
          });
        } else {
          // Create new Op.and structure
          whereClause[Op.and] = [
            whereClause,
            { "$categories.categoryid$": categoryid },
          ];
          // Remove individual properties since they're now in Op.and
          delete whereClause.status;
          delete whereClause.languageid;
        }
      }

      console.log(
        "🔧 Final where clause:",
        JSON.stringify(whereClause, null, 2)
      );

      // Date range filter
      if (startDate || endDate) {
        const dateFilter = queryUtils.buildDateRangeQuery(
          startDate,
          endDate,
          "created_at"
        );

        if (whereClause[Op.and]) {
          whereClause[Op.and].push(dateFilter);
        } else {
          whereClause = { ...whereClause, ...dateFilter };
        }
      }

      // Build include clause - same as index function
      const includeClause = [
        {
          model: User,
          as: "author",
          attributes: ["userid", "first_name", "last_name", "username"],
          required: false, // LEFT JOIN instead of INNER JOIN
        },
        {
          model: Language,
          as: "language",
          attributes: ["languageid", "language_name", "locale_code"],
        },
        {
          model: Category,
          as: "categories",
          attributes: ["categoryid", "category_name"],
          through: { attributes: [] },
          // Category filter moved to main where clause for proper filtering
        },
      ];

      // Build order clause - same as index function
      const orderClause = queryUtils.buildSortQuery(sortBy, sortOrder);

      // Build attributes with relevance scoring
      const searchAttributes = {
        include: [
          [
            require("sequelize").literal(
              "(SELECT COUNT(*) FROM comment WHERE comment.postid = Post.postid)"
            ),
            "comment_count",
          ],
        ],
      };

      // Add relevance score if using Full-Text Search
      if (
        searchQuery.attributes &&
        searchQuery.attributes.include &&
        Array.isArray(searchQuery.attributes.include)
      ) {
        searchAttributes.include.push(...searchQuery.attributes.include);
      }

      // Build order clause with relevance priority
      let finalOrderClause = orderClause;
      if (
        searchQuery.order &&
        Array.isArray(searchQuery.order) &&
        searchQuery.order.length > 0
      ) {
        finalOrderClause = [...searchQuery.order, ...orderClause];
      }

      // Get posts with search and relevance scoring
      const posts = await Post.findAndCountAll({
        where: whereClause,
        include: includeClause,
        attributes: searchAttributes,
        limit,
        offset,
        order: finalOrderClause,
        distinct: true,
      });

      console.log("🔍 Backend search results:", {
        count: posts.count,
        rows: posts.rows.length,
      });

      // Log detailed results for each post with scoring breakdown
      console.log("\n📋 Detailed Search Results with Scoring:");
      console.log("=".repeat(80));

      // Get scoring breakdown for each post
      for (let index = 0; index < posts.rows.length; index++) {
        const post = posts.rows[index];
        console.log(`\n${index + 1}. POST ID: ${post.postid}`);
        console.log(`   Title: "${post.title}"`);
        console.log(
          `   Content Preview: "${
            post.content ? post.content.substring(0, 100) + "..." : "No content"
          }"`
        );

        // Get detailed scoring breakdown
        try {
          const [scoringDetails] = await require("../../../models").sequelize
            .query(`
            SELECT
              postid,
              title,
              MATCH(title, content) AGAINST('${search.trim()}' IN NATURAL LANGUAGE MODE) as base_score,
              CASE WHEN title LIKE '%${search.trim()}%' THEN 2.0 ELSE 0 END as title_boost,
              CASE WHEN title = '${search.trim()}' THEN 5.0 ELSE 0 END as exact_boost,
              (MATCH(title, content) AGAINST('${search.trim()}' IN NATURAL LANGUAGE MODE) +
               CASE WHEN title LIKE '%${search.trim()}%' THEN 2.0 ELSE 0 END +
               CASE WHEN title = '${search.trim()}' THEN 5.0 ELSE 0 END) as calculated_final
            FROM post
            WHERE postid = ${post.postid}
          `);

          if (scoringDetails.length > 0) {
            const scoring = scoringDetails[0];
            console.log(`   📊 SCORING BREAKDOWN:`);
            console.log(
              `      Base Score (MATCH): ${Number(scoring.base_score).toFixed(
                3
              )}`
            );
            console.log(
              `      Title Boost: +${Number(scoring.title_boost).toFixed(1)}`
            );
            console.log(
              `      Exact Match: +${Number(scoring.exact_boost).toFixed(1)}`
            );
            console.log(
              `      Calculated Total: ${Number(
                scoring.calculated_final
              ).toFixed(3)}`
            );
            console.log(
              `      Actual Score: ${
                post.dataValues.relevance_score
                  ? Number(post.dataValues.relevance_score).toFixed(3)
                  : "N/A"
              }`
            );

            // Check if scores match
            const calculated = Number(scoring.calculated_final);
            const actual = Number(post.dataValues.relevance_score || 0);
            const diff = Math.abs(calculated - actual);
            if (diff > 0.001) {
              console.log(`      ⚠️ SCORE MISMATCH: Diff ${diff.toFixed(3)}`);
            } else {
              console.log(`      ✅ Scores match!`);
            }
          }
        } catch (error) {
          console.log(`   ❌ Could not get scoring details: ${error.message}`);
        }

        console.log(
          `   Final Relevance Score: ${
            post.dataValues.relevance_score || "N/A"
          }`
        );
        console.log(`   Comment Count: ${post.dataValues.comment_count || 0}`);
        console.log(
          `   Author: ${post.author ? post.author.username : "Unknown"}`
        );
        console.log(
          `   Language: ${
            post.language ? post.language.language_name : "Unknown"
          }`
        );
        console.log(
          `   Categories: ${
            post.categories
              ? post.categories.map((cat) => cat.category_name).join(", ")
              : "None"
          }`
        );
        console.log(`   Created: ${post.created_at}`);
        console.log(`   Status: ${post.status}`);
        console.log("-".repeat(60));
      }
      console.log("=".repeat(80));

      // Use same pagination response builder as index function
      const paginatedResponse = paginationUtils.buildPaginatedResponse(
        posts.rows,
        posts.count,
        page,
        limit
      );

      return responseUtils.ok(
        res,
        paginatedResponse,
        `Found ${posts.count} posts matching "${search.trim()}"`
      );
    } catch (error) {
      console.error("Error searching posts:", error);
      return responseUtils.error(res, "Failed to search posts", error.message);
    }
  },

  // Search suggestions endpoint with Full-Text Search
  searchSuggestions: async (req, res) => {
    try {
      const { q } = req.query;

      if (!q || q.trim().length < 2) {
        return responseUtils.badRequest(
          res,
          "Query must be at least 2 characters"
        );
      }

      const cleanQuery = q.trim().replace(/'/g, "''");

      try {
        // Try Full-Text Search first for better suggestions
        const [ftSuggestions] = await req.app.get("sequelize").query(`
          SELECT DISTINCT title,
                 MATCH(title, content) AGAINST('${cleanQuery}' IN NATURAL LANGUAGE MODE) as relevance_score
          FROM post
          WHERE MATCH(title, content) AGAINST('${cleanQuery}' IN NATURAL LANGUAGE MODE) > 0
            AND status = 1
          ORDER BY relevance_score DESC
          LIMIT 5
        `);

        if (ftSuggestions.length > 0) {
          const suggestionList = ftSuggestions.map((post) => post.title);
          return responseUtils.ok(res, { suggestions: suggestionList });
        }
      } catch (ftError) {
        console.warn(
          "Full-Text suggestions failed, falling back to LIKE:",
          ftError.message
        );
      }

      // Fallback to LIKE search
      const suggestions = await Post.findAll({
        where: {
          title: {
            [require("sequelize").Op.like]: `%${cleanQuery}%`,
          },
          status: 1,
        },
        attributes: ["title"],
        limit: 5,
        order: [["created_at", "DESC"]],
      });

      const suggestionList = suggestions.map((post) => post.title);

      return responseUtils.ok(res, { suggestions: suggestionList });
    } catch (error) {
      console.error("🔍 Search suggestions error:", error);
      return responseUtils.internalServerError(
        res,
        "Failed to get search suggestions"
      );
    }
  },
};

module.exports = postController;
