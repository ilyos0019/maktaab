const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');
const { verifyAdmin, verifyToken } = require('../middleware/auth');
const { validateInputs, teacherValidation } = require('../middleware/validator');

const router = express.Router();

router.get('/', verifyAdmin, async (req, res) => {
    try {
        const result = await db.query('SELECT id, full_name, subject, class_name, phone, login, role, created_at FROM users WHERE role = $1 ORDER BY id DESC', ['teacher']);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: "Xato yuz berdi" });
    }
});

router.post('/', verifyAdmin, teacherValidation, validateInputs, async (req, res) => {
    try {
        const { full_name, subject, class_name, phone, login, password } = req.body;
        
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        await db.query(
            'INSERT INTO users (full_name, subject, class_name, phone, login, password_hash, role) VALUES ($1, $2, $3, $4, $5, $6, $7)',
            [full_name, subject, class_name, phone, login, hash, 'teacher']
        );
        res.status(201).json({ message: "O'qituvchi muvaffaqiyatli qo'shildi" });
    } catch (err) {
        if(err.code === '23505') return res.status(400).json({ message: "Bu login band" });
        res.status(500).json({ message: "Xato yuz berdi" });
    }
});

router.delete('/:id', verifyAdmin, async (req, res) => {
    try {
        await db.query('DELETE FROM users WHERE id = $1 AND role = $2', [req.params.id, 'teacher']);
        res.json({ message: "O'qituvchi o'chirildi" });
    } catch (err) {
        res.status(500).json({ message: "Xato yuz berdi" });
    }
});

router.put('/:id/reset-pass', verifyAdmin, async (req, res) => {
    try {
        const { newPassword } = req.body;
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(newPassword, salt);
        await db.query('UPDATE users SET password_hash = $1 WHERE id = $2 AND role = $3', [hash, req.params.id, 'teacher']);
        res.json({ message: "Parol tiklandi" });
    } catch (err) {
        res.status(500).json({ message: "Xato yuz berdi" });
    }
});

// Admin o'z parolini/loginini o'zgartirishi
router.put('/credentials', verifyAdmin, async (req, res) => {
    try {
        const { currentPassword, newLogin, newPassword } = req.body;
        const result = await db.query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
        
        const isMatch = await bcrypt.compare(currentPassword, result.rows[0].password_hash);
        if (!isMatch) return res.status(400).json({ message: "Joriy parol noto'g'ri" });

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(newPassword, salt);

        await db.query('UPDATE users SET login = $1, password_hash = $2 WHERE id = $3', [newLogin, hash, req.user.id]);
        res.clearCookie('token');
        res.json({ message: "Ma'lumotlar o'zgartirildi" });
    } catch (err) {
        if(err.code === '23505') return res.status(400).json({ message: "Bu login band" });
        res.status(500).json({ message: "Xato yuz berdi" });
    }
});

module.exports = router;
