const jwtUtils = require("utils/jwtUtils");
const responseUtils = require("utils/responseUtils");
const { User, Role, Permission } = require("models");

const getTokenFromHeader = (req) => {
  const authHeader = req.headers.authorization || "";
  return authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
};

const buildUserContext = (userInstance) => {
  const roleName = String(userInstance?.role?.name || "").toLowerCase();
  const permissions = Array.isArray(userInstance?.role?.permissions)
    ? userInstance.role.permissions.map((p) => String(p.name).toLowerCase())
    : [];

  return { roleName, permissions };
};

const hasAnyPermission = (userPerms, requiredPerms) =>
  requiredPerms.some((perm) => userPerms.includes(String(perm).toLowerCase()));

const authMiddleware = {
  authenticate: async (req, res, next) => {
    const token = getTokenFromHeader(req);

    if (!token)
      return responseUtils.unauthorized(res, "Access token is missing.");

    try {
      const decoded = jwtUtils.verifyToken(token);
      console.log("🔍 Auth Debug - Decoded Token:", {
        userid: decoded.userid,
        roleid: decoded.roleid,
      });

      const user = await User.findByPk(decoded.userid, {
        attributes: ["userid", "roleid", "username"],
        include: [
          {
            model: Role,
            as: "role", // ✅ alias lowercase
            attributes: ["roleid", "name", "status", "deleted_at"],
            include: [
              {
                model: Permission,
                as: "permissions",
                attributes: ["name"],
                through: { attributes: [] },
              },
            ],
          },
        ],
      });

      if (!user || !user.role || user.role.deleted_at || user.role.status === 0) {
        return responseUtils.unauthorized(res, "Invalid user or role.");
      }

      const { roleName, permissions } = buildUserContext(user);

      req.user = {
        userid: user.userid,
        roleid: user.roleid,
        username: user.username,
        roleName,
        permissions,
      };

      // Debug user context
      console.log("✅ Authenticated User:", {
        userid: req.user.userid,
        username: req.user.username,
        role: req.user.roleName,
        permissions: req.user.permissions,
      });

      next();
    } catch (error) {
      console.error("❌ Auth error:", error);
      return responseUtils.unauthorized(res, "Invalid or expired token.");
    }
  },

  requireAuth: (req, res, next) => {
    if (!req.user)
      return responseUtils.unauthorized(res, "Authentication required.");
    next();
  },

  requireRoles: (...allowedRoles) => {
    const normalized = allowedRoles.map((r) => String(r).toLowerCase());
    return (req, res, next) => {
      if (!req.user)
        return responseUtils.unauthorized(res, "Authentication required.");

      if (normalized.includes(req.user.roleName)) return next();

      console.log("❌ Role check failed:", {
        userRole: req.user.roleName,
        allowedRoles: normalized,
      });

      return responseUtils.unauthorized(res, "You do not have permission.");
    };
  },

  requireOwnershipOrRoles: (getTargetUserId, ...allowedRoles) => {
    const normalized = allowedRoles.map((r) => String(r).toLowerCase());
    return (req, res, next) => {
      if (!req.user)
        return responseUtils.unauthorized(res, "Authentication required.");

      const targetId =
        typeof getTargetUserId === "function"
          ? getTargetUserId(req)
          : req.params.userid || req.body.userid;

      const isOwner = targetId && String(req.user.userid) === String(targetId);
      const isAllowedRole = normalized.includes(req.user.roleName);

      if (isOwner || isAllowedRole) return next();

      console.log("❌ Ownership/Role check failed:", {
        userId: req.user.userid,
        targetId,
        role: req.user.roleName,
        allowedRoles: normalized,
      });

      return responseUtils.unauthorized(
        res,
        "Access denied: not owner or insufficient role."
      );
    };
  },

  requireRoleOrPermission: (roles = [], permissions = []) => {
    const normRoles = roles.map((r) => String(r).toLowerCase());
    const normPerms = permissions.map((p) => String(p).toLowerCase());

    return (req, res, next) => {
      if (!req.user)
        return responseUtils.unauthorized(res, "Authentication required.");

      if (normRoles.length && normRoles.includes(req.user.roleName)) {
        return next();
      }

      if (normPerms.length && hasAnyPermission(req.user.permissions || [], normPerms)) {
        return next();
      }

      console.log("❌ Role/Permission check failed:", {
        userRole: req.user.roleName,
        userPerms: req.user.permissions,
        requiredRoles: normRoles,
        requiredPerms: normPerms,
      });

      return responseUtils.unauthorized(res, "You do not have permission.");
    };
  },

  requirePermissions: (...permissions) => {
    return authMiddleware.requireRoleOrPermission([], permissions);
  },
};

module.exports = authMiddleware;