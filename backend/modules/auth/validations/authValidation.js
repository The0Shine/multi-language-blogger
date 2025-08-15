const { body } = require("express-validator");

const authValidation = {
  register: [
    body("first_name").notEmpty().withMessage("First name is required."),
    body("last_name").notEmpty().withMessage("Last name is required."),
    body("email").isEmail().withMessage("Valid email is required."),
    body("username").notEmpty().withMessage("Username is required."),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters."),
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
};

module.exports = authValidation;
