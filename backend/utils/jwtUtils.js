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
            return jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
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