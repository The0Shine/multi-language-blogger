const commentService = require("../services/commentService");
const responseUtils = require("utils/responseUtils");

const commentController = {
  index: async (req, res) => {
    try {
      const { postid } = req.params;
      const result = await commentService.getComments(postid, req.query);

      return responseUtils.ok(res, result, "Comments retrieved successfully");
    } catch (error) {
      console.error("Get comments error:", error);
      if (error.message === "Post not found") {
        return responseUtils.notFound(res, error.message);
      }
      return responseUtils.error(res, "Failed to get comments");
    }
  },

  create: async (req, res) => {
    try {
      const { postid } = req.params;
      const user = req.user;

      if (!user) {
        return responseUtils.unauthorized(res, "Authentication required");
      }

      console.log("💬 Comment controller - user data:", {
        userid: user.userid,
        username: user.username,
        postid,
        body: req.body,
      });

      const comment = await commentService.createComment(
        postid,
        req.body,
        user.username
      );

      return responseUtils.ok(res, { comment }, "Comment created successfully");
    } catch (error) {
      console.error("Create comment error:", error);
      if (error.message === "Post not found") {
        return responseUtils.notFound(res, error.message);
      }
      if (error.message === "Parent comment not found") {
        return responseUtils.notFound(res, error.message);
      }
      return responseUtils.error(res, "Failed to create comment");
    }
  },

  update: async (req, res) => {
    try {
      const { commentid } = req.params;
      const user = req.user;

      if (!user) {
        return responseUtils.unauthorized(res, "Authentication required");
      }

      const updatedComment = await commentService.updateComment(
        commentid,
        req.body,
        user.username
      );

      return responseUtils.ok(
        res,
        { comment: updatedComment },
        "Comment updated successfully"
      );
    } catch (error) {
      console.error("Update comment error:", error);
      if (error.message === "Comment not found") {
        return responseUtils.notFound(res, error.message);
      }
      if (error.message === "Unauthorized to update this comment") {
        return responseUtils.forbidden(res, error.message);
      }
      return responseUtils.error(res, "Failed to update comment");
    }
  },

  // Delete functionality disabled - comments cannot be deleted
  destroy: async (req, res) => {
    return responseUtils.forbidden(res, "Comment deletion is not allowed");
  },

  // Get comment tree with depth information
  getCommentTree: async (req, res) => {
    try {
      const { postid } = req.params;
      const comments = await commentService.getCommentTree(postid);

      return responseUtils.ok(
        res,
        { comments },
        "Comment tree retrieved successfully"
      );
    } catch (error) {
      console.error("Get comment tree error:", error);
      if (error.message === "Post not found") {
        return responseUtils.notFound(res, error.message);
      }
      return responseUtils.error(res, "Failed to get comment tree");
    }
  },
};

module.exports = commentController;
