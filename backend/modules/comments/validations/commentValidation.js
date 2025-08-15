const { body, param } = require("express-validator");

const createCommentRequest = [
  param("postid").notEmpty().isInt({ min: 1 }).withMessage("Valid post ID is required."),
  body("content")
    .notEmpty()
    .isString()
    .isLength({ min: 1, max: 1000 })
    .withMessage("Content must be between 1 and 1000 characters."),
  // Optional parent comment ID for nested replies
  body("parentid").optional().isInt({ min: 1 }).withMessage("Parent comment ID must be a valid integer."),
];

const updateCommentRequest = [
  param("commentid").notEmpty().isInt({ min: 1 }).withMessage("Valid comment ID is required."),
  body("content")
    .notEmpty()
    .isString()
    .isLength({ min: 1, max: 1000 })
    .withMessage("Content must be between 1 and 1000 characters."),
];

const commentParamRequest = [
  param("commentid").notEmpty().isInt({ min: 1 }).withMessage("Valid comment ID is required."),
];

module.exports = {
  createCommentRequest,
  updateCommentRequest,
  commentParamRequest,
};
