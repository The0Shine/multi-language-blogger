console.log("!!!!!!!!!! ĐANG CHẠY PHIÊN BẢN AUTH.SERVICE.JS MỚI NHẤT !!!!!!!!!!");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwtUtils = require("utils/jwtUtils");
const emailUtils = require("utils/emailUtils");
const { User, Role, Permission } = require("models");
const authService = {
  register: async (data) => {
    const { first_name, last_name, email, username, password } = data;
    const emailNorm = String(email || "").trim().toLowerCase();

    const existingUser = await User.findOne({ where: { email: emailNorm } });
    if (existingUser) throw new Error("Email already in use.");

    
    const existingUsername = await User.unscoped().findOne({
      where: { username },
    });

    if (existingUsername) {
      throw new Error("Username already exists");
    }
    const defaultRole = await Role.findOne({ where: { name: "User" } });
    if (!defaultRole)
      throw new Error("Default role not found. Please set up roles in the database.");

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
    const emailNorm = String(email || "").trim().toLowerCase();

        // ✅ Check username
  const existingUsername = await User.unscoped().findOne({
    where: { username },
  });
    if (existingUsername) {
    throw new Error("Username already exists");
  }

    const existingUser = await User.findOne({ where: { email: emailNorm } });
    if (existingUser) throw new Error("Email already in use.");

  

    const adminRole = await Role.findOne({ where: { name: "Admin" } });
    if (!adminRole)
      throw new Error("Admin role not found. Please set up roles in the database.");

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

    if (!user) {
      throw new Error("Invalid credentials.");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error("Invalid credentials.");
    }

    const permissionNames = user.role
      ? user.role.permissions.map((p) => p.name)
      : [];
    
    // ✅ TẠO PAYLOAD ĐẦY ĐỦ THÔNG TIN
    const payload = {
      userid: user.userid,
      roleid: user.roleid,
      username: user.username,
      roleName: user.role ? user.role.name : null,
      permissions: permissionNames,
    };

      // ✅✅✅ THÊM DÒNG LOG CUỐI CÙNG NÀY VÀO
    console.log("--- [LOGIN SERVICE] --- PAYLOAD TO BE SIGNED:", payload);

    const accessToken = jwtUtils.generateToken(payload);
    const refreshToken = jwtUtils.generateRefreshToken({ userid: user.userid });

    delete user.dataValues.password;

    return { accessToken, refreshToken, user };
  },

 refreshToken: async (refreshToken) => {
  // Bước 1: Xác thực refresh token
  const decoded = jwtUtils.verifyRefreshToken(refreshToken);

  // Bước 2: Lấy lại đầy đủ thông tin user và permissions
  const user = await User.findOne({
    where: { userid: decoded.userid },
    include: [
      {
        model: Role,
        as: "role",
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

  if (!user) throw new Error("User not found.");

  const permissionNames = user.role ? user.role.permissions.map((p) => p.name) : [];

  // Bước 3: Tạo payload ĐẦY ĐỦ cho access token mới
  const payload = {
    userid: user.userid,
    roleid: user.roleid,
    username: user.username,
    roleName: user.role ? user.role.name : null,
    permissions: permissionNames,
  };

  // Bước 4: Tạo access token mới từ payload
  const newAccessToken = jwtUtils.generateToken(payload);

  // Bước 5: Trả về access token mới
  return { accessToken: newAccessToken };
},

  forgotPassword: async (email) => {
    const emailNorm = String(email || "").trim().toLowerCase();
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
    const emailNorm = String(email || "").trim().toLowerCase();
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