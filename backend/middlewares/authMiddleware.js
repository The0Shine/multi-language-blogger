const jwtUtils = require("utils/jwtUtils");
const responseUtils = require("utils/responseUtils");

const authMiddleware = {
    authenticate: (req, res, next) => {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return responseUtils.unauthorized(res, "Access token is missing.");
        }

        try {
            const decoded = jwtUtils.verifyToken(token);
            req.user = decoded; // Attach decoded token payload to the request object
            next();
        } catch (error) {
            return responseUtils.unauthorized(res, "Invalid or expired token.");
        }
    },

    authorize: (roles = []) => {
        return (req, res, next) => {
            if (!roles.length || roles.includes(req.user.roleid)) {
                return next();
            }
            return responseUtils.unauthorized(res, "You do not have permission to access this resource.");
        };
    },
};

module.exports = authMiddleware;