const express = require("express");
const router = express.Router();
const { authenticate } = require("middlewares/authMiddleware");
const postController = require("modules/post/controllers/postController");
const postValidation = require("modules/post/validations/postValidation");
const validateMiddleware = require("middlewares/validateMiddleware");
const authMiddleware = require("middlewares/authMiddleware");
const { postCommentRouter } = require("./commentsRoutes");

// Require login for all routes
router.use(authMiddleware.authenticate);

// Admin routes - get all posts including pending/rejected
router.get(
  "/admin/all",
  // authMiddleware.requireRoles("admin"), // Tạm thời comment để test
  postController.getAllForAdmin
);

// Public routes
router.get("/", postController.index);
router.get("/search", postController.search);
router.get("/search/suggestions", postController.searchSuggestions);
router.get("/my-posts", authenticate, postController.getMyPosts);
router.get("/:postid", postController.show);
router.get("/:postid/translations", postController.getTranslations);

router.post(
  "/",
  authenticate,
  postValidation.create,
  validateMiddleware,
  postController.create
);
router.put(
  "/:postid",
  authenticate,

  postController.update
);
router.delete("/:postid", authenticate, postController.destroy);
// Create post
// router.post(
//   "/",
//   postValidation.create,
//   validateMiddleware,
//   postController.create
// );

// // Get all posts (Admin only)
// router.get("/", authMiddleware.requireRoles("Admin"), postController.index);

// // Delete post (Admin only)
// router.delete(
//   "/:postid",
//   authMiddleware.requireRoles("Admin"),
//   validateMiddleware,
//   postController.destroy
// );

// Approve post (Admin only)
router.patch(
  "/:postid/approve",
  authMiddleware.requireRoles(['Admin'], ['moderate_posts']),
  validateMiddleware,
  postController.approve
);

// Reject post (Admin only)
router.patch(
  "/:postid/reject",
  authMiddleware.requireRoles(['Admin'], ['moderate_posts']),
  validateMiddleware,
  postController.reject
);

// Comments routes for posts
router.use("/:postid/comments", postCommentRouter);

// Get a post by ID (accessible to authenticated users)
router.get(
  "/:postid",
  authMiddleware.authenticate,
  validateMiddleware,
  postController.show
);

module.exports = router;
