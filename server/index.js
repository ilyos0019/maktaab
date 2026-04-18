const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const teachersRoutes = require('./routes/teachers');
const studentsRoutes = require('./routes/students');

const app = express();

// Xavfsizlik: Helmet
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:"],
            connectSrc: ["'self'"]
        }
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    },
    xFrameOptions: { action: "deny" }
}));

// CORS
app.use(cors({
    origin: process.env.ALLOWED_ORIGIN,
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// PWA statik fayllar (public papkasi)
app.use(express.static(path.join(__dirname, '../public')));

// API Endpointlar
app.use('/api/auth', authRoutes);
app.use('/api/admin', teachersRoutes);
app.use('/api/teachers', teachersRoutes);
app.use('/api/students', studentsRoutes);

// Barcha boshqa so'rovlarni index.html ga yo'naltirish (SPA qobig'i)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Xatoliklarni ushlash
app.use((err, req, res, next) => {
    console.error('Xatolik:', err);
    res.status(500).json({ message: "Xato yuz berdi" }); // Tizim xatolari yashirilgan
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server ishlashni boshladi: port ${PORT}`);
});
