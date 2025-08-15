const jwt = require("jsonwebtoken");
require("dotenv").config();

const jwtUtils = {
  generateToken: (payload, expiresIn = "1h") => {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
  },
  generateRefreshToken: (payload, expiresIn = "7d") => {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
  },
  verifyToken: (token) => {
    try {
      console.log(
        "🔍 JWT Debug - Verifying token with secret:",
        process.env.JWT_SECRET
      );
      console.log("🔍 JWT Debug - Token length:", token.length);
      const result = jwt.verify(token, process.env.JWT_SECRET);
      console.log("🔍 JWT Debug - Verification successful");
      return result;
    } catch (err) {
      console.log("🔍 JWT Debug - Verification failed:", err.message);
      console.log("🔍 JWT Debug - Error name:", err.name);
      throw new Error("Invalid token");
    }
  },
  verifyRefreshToken: (token) => {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      throw new Error("Invalid refresh token");
    }
  },
};

module.exports = jwtUtils;
