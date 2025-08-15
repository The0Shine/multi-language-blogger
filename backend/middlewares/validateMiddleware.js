const { validationResult } = require("express-validator");
const responseUtils = require("utils/responseUtils");

const validateMiddleware = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => error.msg);
    return responseUtils.badRequest(res, errorMessages.join(", "));
  }

  next();
};

module.exports = validateMiddleware;
