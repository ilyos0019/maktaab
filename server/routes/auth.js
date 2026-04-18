const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { verifyToken } = require('../middleware/auth');
const { loginLimiter } = require('../middleware/rateLimiter');
const { validateInputs, loginValidation } = require('../middleware/validator');

const router = express.Router();

router.post('/login', loginLimiter, loginValidation, validateInputs, async (req, res) => {
    try {
        const { login, password } = req.body;

        const result = await db.query('SELECT * FROM users WHERE login = $1', [login]);
        if (result.rows.length === 0) {
            return res.status(401).json({ message: "Login yoki parol noto'g'ri" });
        }

        const user = result.rows[0];

        // Bloklanganlikni tekshirish
        if (user.locked_until && new Date() < new Date(user.locked_until)) {
            return res.status(403).json({ message: "Hisob vaqtincha bloklangan. Keyinroq urinib ko'ring." });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            let attempts = user.failed_attempts + 1;
            let locked_until = null;
            if (attempts >= 5) {
                locked_until = new Date(Date.now() + 15 * 60 * 1000); // 15 min
            }
            await db.query('UPDATE users SET failed_attempts = $1, locked_until = $2 WHERE id = $3', [attempts, locked_until, user.id]);
            return res.status(401).json({ message: "Login yoki parol noto'g'ri" });
        }

        await db.query('UPDATE users SET failed_attempts = 0, locked_until = NULL WHERE id = $1', [user.id]);

        const token = jwt.sign(
            { id: user.id, role: user.role, name: user.full_name },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 8 * 60 * 60 * 1000 // 8 hours
        });

        res.json({ message: "Muvaffaqiyatli kirish", role: user.role });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Xato yuz berdi" });
    }
});

router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: "Tizimdan chiqildi" });
});

router.post('/change-password', verifyToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const result = await db.query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
        
        const isMatch = await bcrypt.compare(currentPassword, result.rows[0].password_hash);
        if (!isMatch) {
            return res.status(400).json({ message: "Joriy parol noto'g'ri" });
        }

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(newPassword, salt);

        await db.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, req.user.id]);
        res.clearCookie('token'); // Parol o'zgarganda cookie bekor bo'ladi
        res.json({ message: "Parol muvaffaqiyatli o'zgartirildi. Iltimos qayta kiring." });
    } catch (err) {
        res.status(500).json({ message: "Xato yuz berdi" });
    }
});

module.exports = router;
