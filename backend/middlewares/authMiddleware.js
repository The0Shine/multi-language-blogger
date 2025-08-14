const jwtUtils = require("utils/jwtUtils");
const responseUtils = require("utils/responseUtils");
const { User, Role } = require("models");

const getTokenFromHeader = (req) => {
  const authHeader = req.headers.authorization || "";
  return authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
};

const authMiddleware = {
  authenticate: async (req, res, next) => {
    const token = getTokenFromHeader(req);
    if (!token) return responseUtils.unauthorized(res, "Access token is missing.");

    try {
      const decoded = jwtUtils.verifyToken(token);

      const user = await User.findByPk(decoded.userid, {
        attributes: ["userid", "roleid"],
        include: [
          {
            model: Role,
            as: "Role",                    // 🔁 alias phải khớp association
            attributes: ["roleid", "name", "status", "deleted_at"],
          },
        ],
      });

      // Chặn user/role không hợp lệ hoặc role inactive/soft-deleted
      if (!user || !user.Role || user.Role.deleted_at || user.Role.status === 0) {
        return responseUtils.unauthorized(res, "Invalid user or role.");
      }

      req.user = {
        userid: user.userid,
        roleid: user.roleid,
        roleName: String(user.Role.name || "").toLowerCase(),
      };

      next();
    } catch (error) {
      console.error("Auth error:", error);
      return responseUtils.unauthorized(res, "Invalid or expired token.");
    }
  },

  requireAuth: (req, res, next) => {
    if (!req.user) return responseUtils.unauthorized(res, "Authentication required.");
    next();
  },

  requireRoles: (...allowedRoles) => {
    const normalized = allowedRoles.map((r) => String(r).toLowerCase());
    return (req, res, next) => {
      if (!req.user) return responseUtils.unauthorized(res, "Authentication required.");
      if (normalized.includes(String(req.user.roleName))) return next();
      // 👉 Nếu có responseUtils.forbidden thì dùng cái này thay vì unauthorized
      return responseUtils.unauthorized(res, "You do not have permission.");
    };
  },

  requireOwnershipOrRoles: (getTargetUserId, ...allowedRoles) => {
    const normalized = allowedRoles.map((r) => String(r).toLowerCase());
    return (req, res, next) => {
      if (!req.user) return responseUtils.unauthorized(res, "Authentication required.");

      const targetId =
        typeof getTargetUserId === "function"
          ? getTargetUserId(req)
          : req.params.userid || req.body.userid;

      const isOwner =
        targetId != null && String(req.user.userid) === String(targetId);
      const isAllowedRole = normalized.includes(String(req.user.roleName));

      if (isOwner || isAllowedRole) return next();

      // 👉 Nếu có responseUtils.forbidden thì dùng cái này thay vì unauthorized
      return responseUtils.unauthorized(res, "Access denied: not owner or insufficient role.");
    };
  },
};

module.exports = authMiddleware;
