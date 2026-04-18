const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 daqiqa
    max: 5, // 5 ta urinish
    message: { message: "Urinishlar soni oshib ketdi. 15 daqiqadan so'ng qayta urinib ko'ring." },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = { loginLimiter };
