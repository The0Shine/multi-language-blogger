const { body } = require("express-validator");

const authValidation = {
  register: [
    // First name validation
    body("first_name")
      .notEmpty()
      .withMessage("First name is required.")
      .isLength({ min: 2, max: 50 })
      .withMessage("First name must be between 2-50 characters.")
      .matches(/^[a-zA-ZÀ-ÿ\s]+$/)
      .withMessage("First name can only contain letters and spaces.")
      .trim(),

    // Last name validation
    body("last_name")
      .notEmpty()
      .withMessage("Last name is required.")
      .isLength({ min: 2, max: 50 })
      .withMessage("Last name must be between 2-50 characters.")
      .matches(/^[a-zA-ZÀ-ÿ\s]+$/)
      .withMessage("Last name can only contain letters and spaces.")
      .trim(),

    // Email validation
    body("email")
      .isEmail()
      .withMessage("Valid email is required.")
      .normalizeEmail()
      .isLength({ max: 255 })
      .withMessage("Email must not exceed 255 characters."),
    // Username validation
    body("username")
      .notEmpty()
      .withMessage("Username is required.")
      .isLength({ min: 6, max: 30 })
      .withMessage("Username must be between 3-30 characters.")
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage(
        "Username can only contain letters, numbers, and underscores."
      )
      .trim()
      .toLowerCase(),

    // Password validation
    body("password")
      .isLength({ min: 6, max: 128 })
      .withMessage("Password must be between 8-128 characters."),

    // Optional: Phone number validation (if you want to add phone field)

    // Optional: Date of birth validation (if you want to add DOB field)

    // Terms and conditions acceptance
  ],
  registerAdmin: [
    body("first_name").notEmpty().withMessage("First name is required."),
    body("last_name").notEmpty().withMessage("Last name is required."),
    body("email").isEmail().withMessage("Valid email is required."),
    body("username").notEmpty().withMessage("Username is required."),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters."),
  ],
  login: [
    body("username").notEmpty().withMessage("Username is required."),
    body("password").notEmpty().withMessage("Password is required."),
  ],
  refreshToken: [
    body("refreshToken").notEmpty().withMessage("Refresh token is required."),
  ],
  forgotPassword: [
    body("email").isEmail().withMessage("Valid email is required."),
  ],
  resetPassword: [
    body("email").isEmail().withMessage("Valid email is required."),
    body("resetCode").notEmpty().withMessage("Reset code is required."),
    body("newPassword")
      .isLength({ min: 6 })
      .withMessage("New password must be at least 6 characters."),
  ],
  changePassword: [
    body("new_password")
      .isLength({ min: 6 })
      .withMessage("New password must be at least 6 characters."),
  ],
};

module.exports = authValidation;
