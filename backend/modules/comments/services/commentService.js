const { Comment, Post, User } = require("models");

const commentService = {
  /**
   * Get the original post ID (for sharing comments across translations)
   * @param {number} postid - Post ID (could be original or translation)
   * @returns {number} - Original post ID
   */
  async getOriginalPostId(postid) {
    const post = await Post.findOne({ where: { postid } });
    if (!post) {
      throw new Error("Post not found");
    }

    // If this post has originalid, return that (it's a translation)
    // Otherwise return its own postid (it's the original)
    return post.originalid || post.postid;
  },
  /**
   * Get comments for a post with pagination
   * @param {number} postid - Post ID
   * @param {Object} params - Query parameters
   * @returns {Object} - Comments with pagination info
   */
  async getComments(postid, params = {}) {
    const { page = 1, limit = 10 } = params;
    const offset = (page - 1) * limit;

    // Get original post ID to share comments across translations
    const originalPostId = await this.getOriginalPostId(postid);
    console.log(
      `📝 Getting comments for post ${postid}, using original post ${originalPostId}`
    );

    // Get comments ordered by newest first (for flat display with pagination)
    const comments = await Comment.findAndCountAll({
      where: { postid: originalPostId },
      limit: Number.parseInt(limit),
      offset: Number.parseInt(offset),
      order: [["created_at", "DESC"]], // Order by newest first for flat display
    });

    // Enrich comments with user information
    const enrichedComments = await Promise.all(
      comments.rows.map(async (comment) => {
        const user = await User.findOne({
          where: { username: comment.author },
          attributes: ["userid", "first_name", "last_name", "username"],
        });

        return {
          ...comment.toJSON(),
          authorUser: user ? user.toJSON() : null,
        };
      })
    );

    return {
      items: enrichedComments, // Changed from 'comments' to 'items' for consistency
      pagination: {
        page: parseInt(page),
        totalPages: Math.ceil(comments.count / limit),
        total: comments.count,
        limit: parseInt(limit),
        hasNextPage: page * limit < comments.count,
        hasPrevPage: page > 1,
      },
    };
  },

  /**
   * Get comment tree structure for a post
   * @param {number} postid - Post ID
   * @returns {Array} - Nested comment tree
   */
  async getCommentTree(postid) {
    // Get original post ID to share comments across translations
    const originalPostId = await this.getOriginalPostId(postid);
    console.log(
      `🌳 Getting comment tree for post ${postid}, using original post ${originalPostId}`
    );

    // Get all comments for the post
    const comments = await Comment.findAll({
      where: { postid: originalPostId },
      order: [["left", "ASC"]], // Order by nested set left value for proper tree structure
    });

    // Enrich comments with user information
    const enrichedComments = await Promise.all(
      comments.map(async (comment) => {
        const user = await User.findOne({
          where: { username: comment.author },
          attributes: ["userid", "first_name", "last_name", "username"],
        });

        return {
          ...comment.toJSON(),
          authorUser: user ? user.toJSON() : null,
        };
      })
    );

    return enrichedComments;
  },

  /**
   * Create a new comment
   * @param {number} postid - Post ID
   * @param {Object} commentData - Comment data
   * @param {string} author - Author username
   * @returns {Object} - Created comment
   */
  async createComment(postid, commentData, author) {
    console.log("🔍 createComment called with:", {
      postid,
      commentData,
      author,
    });

    const { content, parent_commentid } = commentData;

    // Get original post ID to share comments across translations
    const originalPostId = await this.getOriginalPostId(postid);
    console.log(
      `💬 Creating comment for post ${postid}, storing in original post ${originalPostId}`
    );

    let parentComment = null;
    if (parent_commentid) {
      parentComment = await Comment.findOne({
        where: { commentid: parent_commentid, postid: originalPostId },
      });
      if (!parentComment) {
        throw new Error("Parent comment not found");
      }
    }

    // Create comment with nested set model values
    let left, right;

    if (parentComment) {
      // Insert as child of parent comment
      const rightValue = parentComment.right;

      // Update existing comments to make space
      await Comment.update(
        { right: Comment.sequelize.literal("right + 2") },
        {
          where: {
            postid: originalPostId,
            right: { [Comment.sequelize.Op.gte]: rightValue },
          },
        }
      );

      await Comment.update(
        { left: Comment.sequelize.literal("left + 2") },
        {
          where: {
            postid: originalPostId,
            left: { [Comment.sequelize.Op.gt]: rightValue },
          },
        }
      );

      left = rightValue;
      right = rightValue + 1;
    } else {
      // Insert as root comment
      const maxRight = await Comment.max("right", {
        where: { postid: originalPostId },
      });
      left = maxRight ? maxRight + 1 : 1;
      right = left + 1;
    }

    console.log("💬 Creating comment with data:", {
      postid: originalPostId,
      author,
      content: content.substring(0, 50) + "...",
      left,
      right,
    });

    const comment = await Comment.create({
      postid: originalPostId,
      author,
      content,
      left,
      right,
    });

    console.log("✅ Comment created successfully:", comment.commentid);

    // Enrich comment with user information
    const user = await User.findOne({
      where: { username: author },
      attributes: ["userid", "first_name", "last_name", "username"],
    });

    return {
      ...comment.toJSON(),
      authorUser: user ? user.toJSON() : null,
    };
  },

  /**
   * Update a comment
   * @param {number} commentid - Comment ID
   * @param {Object} updateData - Update data
   * @param {string} author - Author username (for authorization)
   * @returns {Object} - Updated comment
   */
  async updateComment(commentid, updateData, author) {
    const { content } = updateData;

    const comment = await Comment.findByPk(commentid);
    if (!comment) {
      throw new Error("Comment not found");
    }

    // Check if user owns the comment
    if (comment.author !== author) {
      throw new Error("Unauthorized to update this comment");
    }

    await comment.update({ content });

    // Return updated comment with user information
    const updatedComment = await Comment.findByPk(commentid);
    const user = await User.findOne({
      where: { username: updatedComment.author },
      attributes: ["userid", "first_name", "last_name", "username"],
    });

    return {
      ...updatedComment.toJSON(),
      authorUser: user ? user.toJSON() : null,
    };
  },

  /**
   * Delete a comment and its children
   * @param {number} commentid - Comment ID
   * @param {string} author - Author username (for authorization)
   * @returns {boolean} - Success status
   */
  async deleteComment(commentid, author) {
    const comment = await Comment.findByPk(commentid);
    if (!comment) {
      throw new Error("Comment not found");
    }

    // Check if user owns the comment
    if (comment.author !== author) {
      throw new Error("Unauthorized to delete this comment");
    }

    const { postid, left, right } = comment;

    // Delete the comment and all its children using nested set model
    await Comment.destroy({
      where: {
        postid,
        left: { [Comment.sequelize.Op.gte]: left },
        right: { [Comment.sequelize.Op.lte]: right },
      },
    });

    // Update remaining comments to close the gap
    const width = right - left + 1;

    await Comment.update(
      { left: Comment.sequelize.literal(`left - ${width}`) },
      { where: { postid, left: { [Comment.sequelize.Op.gt]: right } } }
    );

    await Comment.update(
      { right: Comment.sequelize.literal(`right - ${width}`) },
      { where: { postid, right: { [Comment.sequelize.Op.gt]: right } } }
    );

    return true;
  },

  /**
   * Get a single comment by ID
   * @param {number} commentid - Comment ID
   * @returns {Object} - Comment
   */
  async getCommentById(commentid) {
    const comment = await Comment.findByPk(commentid, {
      include: [
        {
          model: User,
          as: "authorUser",
          attributes: ["userid", "first_name", "last_name", "username"],
          required: false,
        },
      ],
    });

    if (!comment) {
      throw new Error("Comment not found");
    }

    return comment;
  },
};

module.exports = commentService;
