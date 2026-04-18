const { validationResult, body } = require('express-validator');

const validateInputs = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

const loginValidation = [
    body('login').trim().escape().notEmpty().withMessage('Login kiritish majburiy'),
    body('password').trim().notEmpty().withMessage('Parol kiritish majburiy')
];

const teacherValidation = [
    body('full_name').trim().escape().notEmpty(),
    body('subject').trim().escape().notEmpty(),
    body('class_name').trim().escape().notEmpty(),
    body('phone').trim().escape().notEmpty(),
    body('login').trim().escape().notEmpty(),
    body('password').trim().notEmpty()
];

const studentValidation = [
    body('first_name').trim().escape().notEmpty(),
    body('last_name').trim().escape().notEmpty(),
    body('birth_date').isDate(),
    body('ihr').isLength({ min: 14, max: 14 }).isNumeric(),
    body('father_name').trim().escape().notEmpty(),
    body('mother_name').trim().escape().notEmpty()
];

module.exports = {
    validateInputs,
    loginValidation,
    teacherValidation,
    studentValidation
};
