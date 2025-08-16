const express = require("express");
const validateMiddleware = require("middlewares/validateMiddleware");
const { authenticate } = require("middlewares/authMiddleware");
const commentController = require("modules/comments/controllers/commentController");
const {
  createCommentRequest,
  updateCommentRequest,
  commentParamRequest,
} = require("modules/comments/validations/commentValidation");

const router = express.Router();

// Comments routes for specific post (nested under /posts/:postid/comments)
const postCommentRouter = express.Router({ mergeParams: true });

// Get all comments for a post
postCommentRouter.get("/", commentController.index);

// Get comment tree
postCommentRouter.get("/tree", commentController.getCommentTree);

// Create comment
postCommentRouter.post(
  "/",
  authenticate,
  validateMiddleware,
  commentController.create
);

// General comments routes (for updating/deleting comments)
const commentRouter = express.Router();

// Update comment
commentRouter.put(
  "/:commentid",
  authenticate,
  validateMiddleware,
  commentController.update
);

// Delete functionality disabled for now
// commentRouter.delete(
//   "/:commentid",
//   authenticated,
//   validate(commentParamRequest),
//   commentController.destroy
// );

// Export both routers
module.exports = {
  postCommentRouter,
  commentRouter,
};
