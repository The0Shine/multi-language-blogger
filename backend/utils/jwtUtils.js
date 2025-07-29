const jwt = require("jsonwebtoken");
require("dotenv").config();

const jwtUtils = {
    generateToken: (payload, expiresIn = "1h") => {
        return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
    },
    verifyToken: (token) => {
        try {
            return jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            throw new Error("Invalid token");
        }
    },
};

module.exports = jwtUtils;