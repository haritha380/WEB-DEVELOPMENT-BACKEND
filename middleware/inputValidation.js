const { check, validationResult } = require('express-validator');

const validateUserInput = [
    check('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Invalid email format'),
    check('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/\d/)
        .withMessage('Password must contain a number'),
    check('name')
        .trim()
        .isLength({ min: 2 })
        .withMessage('Name must be at least 2 characters long'),
    check('nic')
        .trim()
        .notEmpty()
        .withMessage('NIC is required'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        next();
    }
];

module.exports = {
    validateUserInput
};
