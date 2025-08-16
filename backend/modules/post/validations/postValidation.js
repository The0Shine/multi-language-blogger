const { body, param } = require("express-validator");

const postValidation = {
  create: [
    body("title").notEmpty().withMessage("Title is required."),
    body("languageid")
      .isInt({ min: 1 })
      .withMessage("Valid language ID is required."),
    body("content")
      .notEmpty()
      .isString()
      .isLength({ min: 1, max: 10000 })
      .withMessage(
        "Content is required and must be between 1 and 10000 characters."
      ),
    body("categoryids")
      .optional()
      .isArray()
      .withMessage("Category IDs must be an array."),
    body("status")
      .optional()
      .isIn([-1, 0, 1])
      .withMessage(
        "Status must be -1 (rejected), 0 (draft), or 1 (published)."
      ),
  ],

  updateStatus: [
    param("postid").isInt({ min: 1 }).withMessage("Invalid post ID."),
    body("status")
      .isIn([-1, 0, 1])
      .withMessage("Status must be -1 (draft), 0 (pending), or 1 (published)."),
  ],

  delete: [param("postid").isInt({ min: 1 }).withMessage("Invalid post ID.")],
};

module.exports = postValidation;
