const { body, validationResult } = require('express-validator');

const validateUser = [
    body('email')
        .isEmail()
        .withMessage('Please provide a valid email')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Name is required')
        .isLength({ min: 2 })
        .withMessage('Name must be at least 2 characters long'),
    body('nic')
        .optional()
        .trim()
        .isLength({ min: 5 })
        .withMessage('NIC must be at least 5 characters'),
    body('country')
        .optional()
        .isIn(['Belgium', 'France', 'Sweden'])
        .withMessage('Country must be Belgium, France, or Sweden'),
    body('gender')
        .optional()
        .isIn(['Male', 'Female', 'N/A'])
        .withMessage('Gender must be Male, Female, or N/A'),
    body('language')
        .optional()
        .isIn(['English', 'Spanish', 'French', 'German', 'Dutch', 'Japanese'])
        .withMessage('Invalid language selection'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array().map(error => ({
                    field: error.param,
                    message: error.msg,
                    value: error.value
                }))
            });
        }
        next();
    }
];

const validateLogin = [
    body('email')
        .isEmail()
        .withMessage('Please provide a valid email')
        .normalizeEmail(),
    body('password')
        .notEmpty()
        .withMessage('Password is required'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array().map(error => ({
                    field: error.param,
                    message: error.msg,
                    value: error.value
                }))
            });
        }
        next();
    }
];

module.exports = {
    validateUser,
    validateLogin
};
