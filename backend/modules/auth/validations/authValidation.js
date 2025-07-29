const { body } = require("express-validator");

const authValidation = {
    register: [
        body("first_name").notEmpty().withMessage("First name is required."),
        body("last_name").notEmpty().withMessage("Last name is required."),
        body("email").isEmail().withMessage("Valid email is required."),
        body("username").notEmpty().withMessage("Username is required."),
        body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters."),
        body("roleid").isInt().withMessage("Role ID must be an integer."),
    ],
    login: [
        body("email").isEmail().withMessage("Valid email is required."),
        body("password").notEmpty().withMessage("Password is required."),
    ],
};

module.exports = authValidation;