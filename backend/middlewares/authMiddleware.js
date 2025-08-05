const jwtUtils = require("utils/jwtUtils");
const responseUtils = require("utils/responseUtils");
const { User, Role } = require("models");

const authMiddleware = {
  // Xác thực token và attach thông tin user + role
  authenticate: async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return responseUtils.unauthorized(res, "Access token is missing.");
    }

    try {
      const decoded = jwtUtils.verifyToken(token);

      const user = await User.findByPk(decoded.userid, {
        include: [
          {
            model: Role,
            as: "Role",
            attributes: ["roleid", "name"],
          },
        ],
      });

      if (!user || !user.Role) {
        return responseUtils.unauthorized(res, "Invalid user or role.");
      }

      req.user = {
        userid: user.userid,
        roleid: user.roleid,
        roleName: user.Role.name.toLowerCase(), // e.g., 'admin', 'author'
      };

      next();
    } catch (error) {
      console.error("Auth error:", error);
      return responseUtils.unauthorized(res, "Invalid or expired token.");
    }
  },

  // Phân quyền theo role name (ví dụ: 'admin', 'reviewer')
  authorizeRoles: (...allowedRoles) => {
    return (req, res, next) => {
      if (!req.user) {
        return responseUtils.unauthorized(res, "Authentication required.");
      }

      const userRole = req.user.roleName;
      if (allowedRoles.map((r) => r.toLowerCase()).includes(userRole)) {
        return next();
      }

      return responseUtils.unauthorized(
        res,
        "You do not have permission to access this resource."
      );
    };
  },

  // Chỉ cho phép chính chủ hoặc admin truy cập
  requireOwnershipOrAdmin: (getTargetUserId) => {
    return (req, res, next) => {
      if (!req.user) {
        return responseUtils.unauthorized(res, "Authentication required.");
      }

      if (req.user.roleName === "admin") {
        return next();
      }

      const targetUserId =
        typeof getTargetUserId === "function"
          ? getTargetUserId(req)
          : req.params.userid || req.body.userid;

      if (String(req.user.userid) === String(targetUserId)) {
        return next();
      }

      return responseUtils.unauthorized(
        res,
        "You can only access your own resources."
      );
    };
  },
};

module.exports = authMiddleware;
