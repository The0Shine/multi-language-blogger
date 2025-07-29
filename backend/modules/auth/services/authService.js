const bcrypt = require("bcrypt");
const jwtUtils = require("utils/jwtUtils");
const { User, Role } = require("models");

const authService = {
    register: async (data) => {
        const { first_name, last_name, email, username, password } = data;

        // Check if user already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            throw new Error("Email already in use.");
        }

        // Assign a default role if roleid is not provided
        const defaultRole = await Role.findOne({ where: { name: "User" } }); // Replace "User" with your default role name
        if (!defaultRole) {
            throw new Error("Default role not found. Please set up roles in the database.");
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the user
        const newUser = await User.create({
            first_name,
            last_name,
            email,
            username,
            password: hashedPassword,
            roleid: defaultRole.roleid, // Assign the default role ID
            status: 1, // Active by default
        });

        // Generate access token
        const accessToken = jwtUtils.generateToken({ userid: newUser.userid, roleid: newUser.roleid });

        return { user: newUser, accessToken };
    },

    login: async (data) => {
        const { username, password } = data;

        // Find user by username
        const user = await User.findOne({ where: { username } });
        if (!user) {
            throw new Error("User not found.");
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new Error("Invalid credentials.");
        }

        // Generate JWT token
        return jwtUtils.generateToken({ userid: user.userid, roleid: user.roleid });
    },
};

module.exports = authService;