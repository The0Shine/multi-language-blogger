const responseUtils = require("utils/responseUtils");

const roleMiddleware = (roles = []) => {
    return (req, res, next) => {
        if (!req.user) {
            return responseUtils.unauthorized(res, "User not authenticated.");
        }

        if (!roles.length || roles.includes(req.user.roleid)) {
            return next();
        }

        return responseUtils.unauthorized(res, "You do not have permission to access this resource.");
    };
};

module.exports = roleMiddleware;
