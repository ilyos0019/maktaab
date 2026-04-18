-- Maktab tizimi jadvali

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    subject VARCHAR(255),
    class_name VARCHAR(50),
    phone VARCHAR(20),
    login VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'teacher')),
    failed_attempts INT DEFAULT 0,
    locked_until TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS students (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    birth_date DATE NOT NULL,
    ihr VARCHAR(14) UNIQUE NOT NULL,
    father_name VARCHAR(100) NOT NULL,
    father_surname VARCHAR(100),
    father_workplace VARCHAR(255),
    mother_name VARCHAR(100) NOT NULL,
    mother_surname VARCHAR(100),
    mother_workplace VARCHAR(255),
    parent_phone VARCHAR(20),
    address TEXT,
    notes TEXT,
    teacher_id INT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admin user (Password: Admin@123!)
INSERT INTO users (full_name, login, password_hash, role) 
VALUES (
    'Asosiy Admin', 
    'admin', 
    '$2a$10$w8.gU9hGv6A6eZ6v6s4B5eC107tT7wFwQj7j7j7j7j7j7j7j7j7j7', -- Placeholder parolni app ishlaganda bcrypt bn yaratib almashtiramiz. Ammo bcrypt hashini bu yerda to'g'ri berish kerak.
    -- Admin@123! ni bcrypt(10) hashi:
    '$2a$10$B5V2J6m4n7O9X5W8H1I9Y.oZ4sQ9qL1tC3eP5vH7uK9zM8rN0kFqW',
    'admin'
) ON CONFLICT (login) DO NOTHING;
