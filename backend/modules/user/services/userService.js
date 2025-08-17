const { User, Role } = require("models");
const bcrypt = require("bcrypt");

const userService = {
  // Get all users with pagination and search
  getAllUsers: async (page = 1, limit = 10, search = "") => {
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (search) {
      whereClause[require("sequelize").Op.or] = [
        { first_name: { [require("sequelize").Op.like]: `%${search}%` } },
        { last_name: { [require("sequelize").Op.like]: `%${search}%` } },
        { email: { [require("sequelize").Op.like]: `%${search}%` } },
        { username: { [require("sequelize").Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows } = await User.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Role,
          as: "role",
          attributes: ["name"],
        },
      ],
      attributes: { exclude: ["password"] }, // Don't return password
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["created_at", "DESC"]],
    });

    return {
      users: rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit),
      },
    };
  },

  // Get user by ID
  getUserById: async (userid) => {
    const user = await User.findByPk(userid, {
      include: [
        {
          model: Role,
          as: "role",
          attributes: ["name"],
        },
      ],
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  },

  // Update user information
  updateUser: async (userid, updateData) => {
    const user = await User.findByPk(userid);

    if (!user) {
      throw new Error("User not found");
    }

    // If password is being updated, hash it
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    // Remove sensitive fields that shouldn't be updated directly
    delete updateData.userid;
    delete updateData.created_at;
    delete updateData.updated_at;
    delete updateData.deleted_at;

    await user.update(updateData);

    // Return updated user without password
    const updatedUser = await User.findByPk(userid, {
      include: [
        {
          model: Role,
          as: "role", // Fix: use lowercase 'role' to match association alias
          attributes: ["name"],
        },
      ],
      attributes: { exclude: ["password"] },
    });

    return updatedUser;
  },

  // Update user role specifically
  updateUserRole: async (userid, roleid) => {
    const user = await User.findByPk(userid);

    if (!user) {
      throw new Error("User not found");
    }

    // Verify the role exists
    const role = await Role.findByPk(roleid);
    if (!role) {
      throw new Error("Role not found");
    }

    await user.update({ roleid });

    // Return updated user with role information
    const updatedUser = await User.findByPk(userid, {
      include: [
        {
          model: Role,
          as: "role",
          attributes: ["name"],
        },
      ],
      attributes: { exclude: ["password"] },
    });

    return updatedUser;
  },

  // Delete user (soft delete)
  deleteUser: async (userid) => {
    const user = await User.findByPk(userid);

    if (!user) {
      throw new Error("User not found");
    }

    await user.destroy(); // This will set deleted_at timestamp (soft delete)

    return { message: "User deleted successfully" };
  },

  // Hard delete user (permanent)
  hardDeleteUser: async (userid) => {
    const user = await User.findByPk(userid, { paranoid: false });

    if (!user) {
      throw new Error("User not found");
    }

    await user.destroy({ force: true }); // Permanent deletion

    return { message: "User permanently deleted" };
  },

  // Get user statistics
  getUserStats: async () => {
    const totalUsers = await User.count();
    const activeUsers = await User.count({ where: { status: 1 } });
    const inactiveUsers = await User.count({ where: { status: 0 } });

    return {
      totalUsers,
      activeUsers,
      inactiveUsers,
    };
  },

  // Thêm vào cuối object userService
  getDetailedUserStats: async () => {
    const usersByRole = await User.findAll({
      attributes: [
        "roleid",
        [
          require("sequelize").fn("COUNT", require("sequelize").col("userid")),
          "count",
        ],
      ],
      group: ["roleid"],
      include: [
        {
          model: Role,
          as: "role",
          attributes: ["name"],
        },
      ],
      raw: true,
    });

    return usersByRole.map((entry) => ({
      roleid: entry.roleid,
      roleName: entry["role.name"],
      count: parseInt(entry.count),
    }));
  },
  changePassword: async (userid, passwordData) => {
    const { currentPassword, newPassword } = passwordData;

    const user = await User.findByPk(userid);
    if (!user) {
      throw new Error("User not found");
    }

    // Verify current password
    const isValidPassword = await hash.check(currentPassword, user.password);
    if (!isValidPassword) {
      throw new Error("Current password is incorrect");
    }

    // Hash new password
    const hashedNewPassword = await hash.make(newPassword);

    // Update password
    await user.update({ password: hashedNewPassword });

    return true;
  },
};

module.exports = userService;
