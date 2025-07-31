const responseUtils = require("utils/responseUtils");
const { User, Role } = require("models");

const authorizationMiddleware = {
    // Check if user is authenticated
    requireAuth: (req, res, next) => {
        if (!req.user) {
            return responseUtils.unauthorized(res, "Authentication required.");
        }
        next();
    },

    // Check if user has admin role (full access)
    requireAdmin: async (req, res, next) => {
        try {
            if (!req.user) {
                return responseUtils.unauthorized(res, "Authentication required.");
            }

            // Admin has full access to everything
            if (req.user.roleid === 6) { // Assuming roleid 2 is Admin
                return next();
            }

            return responseUtils.unauthorized(res, "Admin access required.");
        } catch (error) {
            return responseUtils.internalServerError(res, "Authorization error.");
        }
    },

    // Check if user has specific role(s)
    requireRole: (allowedRoles = []) => {
        return async (req, res, next) => {
            try {
                if (!req.user) {
                    return responseUtils.unauthorized(res, "Authentication required.");
                }

                // Admin has access to everything
                if (req.user.roleid === 6) {
                    return next();
                }

                // Check if user has one of the allowed roles
                if (allowedRoles.length === 0 || allowedRoles.includes(req.user.roleid)) {
                    return next();
                }

                return responseUtils.unauthorized(res, "Insufficient permissions.");
            } catch (error) {
                return responseUtils.internalServerError(res, "Authorization error.");
            }
        };
    },

    // Check if user can access their own resource or is admin
    requireOwnershipOrAdmin: (resourceUserIdField = 'userid') => {
        return async (req, res, next) => {
            try {
                if (!req.user) {
                    return responseUtils.unauthorized(res, "Authentication required.");
                }

                // Admin can access everything
                if (req.user.roleid === 6) {
                    return next();
                }

                // Check if user is accessing their own resource
                const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];
                if (req.user.userid == resourceUserId) {
                    return next();
                }

                return responseUtils.unauthorized(res, "You can only access your own resources.");
            } catch (error) {
                return responseUtils.internalServerError(res, "Authorization error.");
            }
        };
    },

    // Check if user can perform action on specific resource
    requirePermission: (action, resource) => {
        return async (req, res, next) => {
            try {
                if (!req.user) {
                    return responseUtils.unauthorized(res, "Authentication required.");
                }

                // Admin has all permissions
                if (req.user.roleid === 6) {
                    return next();
                }

                // Here you can add more specific permission checks based on your needs
                // For now, we'll allow users to access their own resources
                return next();
            } catch (error) {
                return responseUtils.internalServerError(res, "Authorization error.");
            }
        };
    },

    // Get user's role information
    getUserRole: async (req, res, next) => {
        try {
            if (!req.user) {
                return responseUtils.unauthorized(res, "Authentication required.");
            }

            const user = await User.findByPk(req.user.userid, {
                include: [
                    {
                        model: Role,
                        as: 'Role',
                        attributes: ['name', 'roleid']
                    }
                ]
            });

            if (!user) {
                return responseUtils.unauthorized(res, "User not found.");
            }

            req.userRole = user.Role;
            next();
        } catch (error) {
            return responseUtils.internalServerError(res, "Error fetching user role.");
        }
    }
};

module.exports = authorizationMiddleware; 