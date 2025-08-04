
const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 phút
    max: 5, // tối đa 5 lần login/phút/IP
    message: "Too many login attempts. Please try again later.",
     handler: (req, res) => {
        console.log("Rate limit hit by IP:", req.ip);  // Kiểm tra IP nào bị chặn
        return res.status(429).json({ message: "Too many login attempts. Please try again later." });
    }
});

module.exports = loginLimiter;
