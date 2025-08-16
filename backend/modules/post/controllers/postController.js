const postService = require("../services/postService");
const responseUtils = require("utils/responseUtils");
const paginationUtils = require("utils/paginationUtils");
const queryUtils = require("utils/queryUtils");
const { Post } = require("models");
const { User, Language, Category } = require("models");

const postController = {
// Admin: Get all posts (bao gồm cả pending/rejected) không giới hạn
getAllForAdmin: async (req, res) => {
  try {
    const params = {
      ...req.query,
      includeAllStatuses: true, // Flag để lấy tất cả status
      noLimit: true             // Flag để service hiểu là không cần phân trang
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

      // Build search query - same as index function
      let whereClause = {
        status: 1, // Only search published posts (1 = published)
        ...queryUtils.buildSearchQuery(search.trim(), ["title", "content"]),
      };

      // Language filter - search only in current language
      if (languageid) {
        whereClause.languageid = languageid;
        console.log(`🌍 Filtering search by language: ${languageid}`);
      } else {
        // Default to English if no language specified
        whereClause.languageid = 1;
        console.log(`🌍 Defaulting search to English (languageid: 1)`);
      }

      // Date range filter
      if (startDate || endDate) {
        whereClause = {
          ...whereClause,
          ...queryUtils.buildDateRangeQuery(startDate, endDate, "created_at"),
        };
      }

      // Build include clause - same as index function
      const includeClause = [
        {
          model: User.scope("active"),
          as: "author",
          attributes: ["userid", "first_name", "last_name", "username"],
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
          ...(categoryid && { where: { categoryid } }),
        },
      ];

      // Build order clause - same as index function
      const orderClause = queryUtils.buildSortQuery(sortBy, sortOrder);

      // Get posts with search - same structure as index function
      const posts = await Post.findAndCountAll({
        where: whereClause,
        include: includeClause,
        attributes: {
          include: [
            [
              require("sequelize").literal(
                "(SELECT COUNT(*) FROM comments WHERE comments.postid = Post.postid)"
              ),
              "comment_count",
            ],
          ],
        },
        limit,
        offset,
        order: orderClause,
        distinct: true,
      });

      console.log("🔍 Backend search results:", {
        count: posts.count,
        rows: posts.rows.length,
      });

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
};

module.exports = postController;
