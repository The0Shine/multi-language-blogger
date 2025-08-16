const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwtUtils = require("utils/jwtUtils");
const emailUtils = require("utils/emailUtils");
const { User, Role } = require("models");

const authService = {
  register: async (data) => {
    const { first_name, last_name, email, username, password } = data;
    const emailNorm = String(email || "")
      .trim()
      .toLowerCase();

    // unique email
    const existingUser = await User.findOne({ where: { email: emailNorm } });
    if (existingUser) throw new Error("Email already in use.");

    // default role = "User"
    const defaultRole = await Role.findOne({
      where: { name: "User" }, // + có thể thêm status:1, deleted_at:null nếu bạn dùng soft-delete
    });
    if (!defaultRole)
      throw new Error(
        "Default role not found. Please set up roles in the database."
      );

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      first_name,
      last_name,
      email: emailNorm,
      username,
      password: hashedPassword,
      roleid: defaultRole.roleid,
      status: 1,
    });

    return { user: newUser };
  },

  registerAdmin: async (data) => {
    const { first_name, last_name, email, username, password } = data;
    const emailNorm = String(email || "")
      .trim()
      .toLowerCase();

    const existingUser = await User.findOne({ where: { email: emailNorm } });
    if (existingUser) throw new Error("Email already in use.");

    const adminRole = await Role.findOne({
      where: { name: "Admin" }, // + có thể thêm status:1, deleted_at:null
    });
    if (!adminRole)
      throw new Error(
        "Admin role not found. Please set up roles in the database."
      );

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = await User.create({
      first_name,
      last_name,
      email: emailNorm,
      username,
      password: hashedPassword,
      roleid: adminRole.roleid,
      status: 1,
    });

    return { user: newAdmin };
  },

  login: async (data) => {
    const { username, password } = data;

    const user = await User.findOne({
      where: { username },
      include: [
        {
          model: Role,
          as: "role",
          attributes: ["name", "discription"], // Fix: use correct column name
        },
      ],
      attributes: { exclude: ["password"] },
    });

    if (!user) throw new Error("User not found.");

    // Need to get user with password for validation
    const userWithPassword = await User.findOne({ where: { username } });
    const isPasswordValid = await bcrypt.compare(
      password,
      userWithPassword.password
    );
    if (!isPasswordValid) throw new Error("Invalid credentials.");

    const payload = { userid: user.userid, roleid: user.roleid };
    const accessToken = jwtUtils.generateToken(payload);
    const refreshToken = jwtUtils.generateRefreshToken(payload);

    return { accessToken, refreshToken, user };
  },

  refreshToken: async (refreshToken) => {
    const decoded = jwtUtils.verifyRefreshToken(refreshToken);
    const user = await User.findByPk(decoded.userid);
    if (!user) throw new Error("User not found.");

    const payload = { userid: user.userid, roleid: user.roleid };
    const newAccessToken = jwtUtils.generateToken(payload);

    return { accessToken: newAccessToken };
  },

  forgotPassword: async (email) => {
    const emailNorm = String(email || "")
      .trim()
      .toLowerCase();
    const user = await User.findOne({ where: { email: emailNorm } });
    if (!user) throw new Error("User with this email does not exist.");

    const resetCode = crypto.randomInt(100000, 999999).toString();
    const resetExpiry = new Date(Date.now() + 15 * 60 * 1000);

    const resetData = { resetCode, resetExpiry: resetExpiry.toISOString() };

    await user.update({ extra_info: JSON.stringify(resetData) });
    await emailUtils.sendResetPasswordEmail(emailNorm, resetCode);

    return { message: "Reset code sent to your email." };
  },

  resetPassword: async (email, resetCode, newPassword) => {
    const emailNorm = String(email || "")
      .trim()
      .toLowerCase();
    const user = await User.findOne({ where: { email: emailNorm } });
    if (!user) throw new Error("User with this email does not exist.");

    if (!user.extra_info)
      throw new Error("No reset code found. Please request a new one.");

    let resetData;
    try {
      resetData = JSON.parse(user.extra_info);
    } catch {
      throw new Error("Invalid reset data. Please request a new reset code.");
    }

    if (!resetData.resetCode || !resetData.resetExpiry) {
      throw new Error("No valid reset code found. Please request a new one.");
    }
    if (resetData.resetCode !== resetCode)
      throw new Error("Invalid reset code.");

    const now = new Date();
    const expiry = new Date(resetData.resetExpiry);
    if (now > expiry)
      throw new Error("Reset code has expired. Please request a new one.");

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await user.update({ password: hashedPassword, extra_info: null });

    return { message: "Password reset successfully." };
  },
};

module.exports = authService;
