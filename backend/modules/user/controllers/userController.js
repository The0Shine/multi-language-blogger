const userService = require('modules/user/services/userService');
const responseUtils = require('utils/responseUtils');

const userController = {
    // Get all users with pagination and search
    getAllUsers: async (req, res) => {
        try {
            const { page = 1, limit = 10, search = '' } = req.query;
            
            const result = await userService.getAllUsers(page, limit, search);
            
            return responseUtils.ok(res, {
                message: 'Users retrieved successfully',
                data: result.users,
                pagination: result.pagination
            });
        } catch (error) {
            console.error('Get all users error:', error);
            return responseUtils.internalServerError(res, error.message);
        }
    },

    // Get user by ID
    getUserById: async (req, res) => {
        try {
            const { userid } = req.params;
            
            const user = await userService.getUserById(userid);
            
            return responseUtils.ok(res, {
                message: 'User retrieved successfully',
                data: user
            });
        } catch (error) {
            console.error('Get user by ID error:', error);
            if (error.message === 'User not found') {
                return responseUtils.notFound(res, error.message);
            }
            return responseUtils.internalServerError(res, error.message);
        }
    },

    // Update user information (excluding role)
    updateUser: async (req, res) => {
        try {
            const { userid } = req.params;
            const updateData = req.body;
            
            // Validate required fields
            if (!updateData.first_name || !updateData.last_name || !updateData.email) {
                return responseUtils.badRequest(res, 'First name, last name, and email are required');
            }

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(updateData.email)) {
                return responseUtils.badRequest(res, 'Invalid email format');
            }

            // Check if email is already taken by another user
            const existingUser = await require('models').User.findOne({
                where: {
                    email: updateData.email,
                    userid: { [require('sequelize').Op.ne]: userid }
                }
            });

            if (existingUser) {
                return responseUtils.badRequest(res, 'Email is already taken by another user');
            }

            const updatedUser = await userService.updateUser(userid, updateData);
            
            return responseUtils.ok(res, {
                message: 'User updated successfully',
                data: updatedUser
            });
        } catch (error) {
            console.error('Update user error:', error);
            if (error.message === 'User not found') {
                return responseUtils.notFound(res, error.message);
            }
            return responseUtils.internalServerError(res, error.message);
        }
    },

    // Update user role specifically
    updateUserRole: async (req, res) => {
        try {
            const { userid } = req.params;
            const { roleid } = req.body;
            
            if (!roleid) {
                return responseUtils.badRequest(res, 'Role ID is required');
            }

            const updatedUser = await userService.updateUserRole(userid, roleid);
            
            return responseUtils.ok(res, {
                message: 'User role updated successfully',
                data: updatedUser
            });
        } catch (error) {
            console.error('Update user role error:', error);
            if (error.message === 'User not found') {
                return responseUtils.notFound(res, error.message);
            }
            if (error.message === 'Role not found') {
                return responseUtils.badRequest(res, error.message);
            }
            return responseUtils.serverError(res, error.message);
        }
    },

    // Delete user (soft delete)
    deleteUser: async (req, res) => {
        try {
            const { userid } = req.params;
            
            const result = await userService.deleteUser(userid);
            
            return responseUtils.ok(res, {
                message: result.message
            });
        } catch (error) {
            console.error('Delete user error:', error);
            if (error.message === 'User not found') {
                return responseUtils.notFound(res, error.message);
            }
            return responseUtils.internalServerError(res, error.message);
        }
    },

    // Hard delete user (permanent)
    hardDeleteUser: async (req, res) => {
        try {
            const { userid } = req.params;
            
            const result = await userService.hardDeleteUser(userid);
            
            return responseUtils.ok(res, {
                message: result.message
            });
        } catch (error) {
            console.error('Hard delete user error:', error);
            if (error.message === 'User not found') {
                return responseUtils.notFound(res, error.message);
            }
            return responseUtils.serverError(res, error.message);
        }
    },

    // Get user statistics
    getUserStats: async (req, res) => {
        try {
            const stats = await userService.getUserStats();
            
            return responseUtils.ok(res, {
                message: 'User statistics retrieved successfully',
                data: stats
            });
        } catch (error) {
            console.error('Get user stats error:', error);
            return responseUtils.serverError(res, error.message);
        }
    },

    // Get detailed user statistics
    getDetailedUserStats: async (req, res) => {
        try {
            const stats = await userService.getDetailedUserStats();
            
            return responseUtils.ok(res, {
                message: 'Detailed user statistics retrieved successfully',
                data: stats
            });
        } catch (error) {
            console.error('Get detailed user stats error:', error);
            return responseUtils.serverError(res, error.message);
        }
    },

    // Get all roles for user role management
    getAllRoles: async (req, res) => {
        try {
            const roles = await userService.getAllRoles();
            
            return responseUtils.ok(res, {
                message: 'Roles retrieved successfully',
                data: roles
            });
        } catch (error) {
            console.error('Get all roles error:', error);
            return responseUtils.serverError(res, error.message);
        }
    }
};

module.exports = userController;
