const express = require('express');
const db = require('../db');
const { verifyToken } = require('../middleware/auth');
const { validateInputs, studentValidation } = require('../middleware/validator');

const router = express.Router();

router.get('/', verifyToken, async (req, res) => {
    try {
        let query = 'SELECT * FROM students';
        let params = [];

        // Agar ustoz bo'lsa faqat o'zining o'quvchilarini ko'radi
        if (req.user.role === 'teacher') {
            query += ' WHERE teacher_id = $1';
            params.push(req.user.id);
        }

        query += ' ORDER BY id DESC';

        const result = await db.query(query, params);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: "Xato yuz berdi" });
    }
});

router.post('/', verifyToken, studentValidation, validateInputs, async (req, res) => {
    try {
        const {
            first_name, last_name, birth_date, ihr,
            father_name, father_surname, father_workplace,
            mother_name, mother_surname, mother_workplace,
            parent_phone, address, notes
        } = req.body;

        const teacher_id = req.user.role === 'teacher' ? req.user.id : req.body.teacher_id;

        await db.query(
            `INSERT INTO students (
                first_name, last_name, birth_date, ihr,
                father_name, father_surname, father_workplace,
                mother_name, mother_surname, mother_workplace,
                parent_phone, address, notes, teacher_id
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
            [
                first_name, last_name, birth_date, ihr,
                father_name, father_surname, father_workplace,
                mother_name, mother_surname, mother_workplace,
                parent_phone, address, notes, teacher_id
            ]
        );
        res.status(201).json({ message: "O'quvchi qo'shildi" });
    } catch (err) {
        if(err.code === '23505') return res.status(400).json({ message: "Bu IHR allaqachon mavjud" });
        res.status(500).json({ message: "Xato yuz berdi" });
    }
});

router.delete('/:id', verifyToken, async (req, res) => {
    try {
        if (req.user.role === 'teacher') {
            // O'qituvchi faqat o'z o'quvchisini o'chira oladi
            const result = await db.query('DELETE FROM students WHERE id = $1 AND teacher_id = $2', [req.params.id, req.user.id]);
            if (result.rowCount === 0) return res.status(403).json({ message: "Sizda bunday huquq yo'q" });
        } else {
            await db.query('DELETE FROM students WHERE id = $1', [req.params.id]);
        }
        res.json({ message: "O'quvchi o'chirildi" });
    } catch (err) {
        res.status(500).json({ message: "Xato yuz berdi" });
    }
});

module.exports = router;
