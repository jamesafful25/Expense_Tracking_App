const { body } = require('express-validator');

const registerRules = [
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
];

const loginRules = [
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
];

const expenseRules = [
    body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 200 }),
    body('amount')
    .notEmpty().withMessage('Amount is required')
    .toFloat()
    .isFloat({ min: 0.01 }).withMessage('Amount must be a positive number'),
    body('type')
    .isIn(['expense', 'income'])
    .withMessage('Type must be expense or income'),
    body('date').notEmpty().withMessage('Date is required').isDate().withMessage('Valid date is required'),
    body('categoryId')
    .optional({ checkFalsy: true })
    .toInt()
    .isInt({ min: 1 }).withMessage('Invalid category'),
    body('paymentMethod')
    .optional({ checkFalsy: true })
    .isIn(['cash', 'card', 'bank_transfer', 'mobile_money', 'other'])
    .withMessage('Invalid payment method'),
    body('notes').optional({ checkFalsy: true }).isString(),
    body('tags').optional({ checkFalsy: true }),
];

const budgetRules = [
    body('name').trim().notEmpty().withMessage('Budget name is required'),
    body('amount')
    .notEmpty().withMessage('Amount is required')
    .toFloat()
    .isFloat({ min: 0.01 }).withMessage('Amount must be positive'),
    body('period')
    .isIn(['daily', 'weekly', 'monthly', 'yearly'])
    .withMessage('Invalid period'),
    body('startDate').isDate().withMessage('Valid start date is required'),
];

const categoryRules = [
    body('name').trim().notEmpty().withMessage('Category name is required'),
    body('type').optional({ checkFalsy: true }).isIn(['expense', 'income', 'both']),
];

const profileUpdateRules = [
    body('name').optional({ checkFalsy: true }).trim().notEmpty().isLength({ max: 100 }),
    body('currency').optional({ checkFalsy: true }).isLength({ min: 3, max: 3 }),
];

module.exports = {
    registerRules,
    loginRules,
    expenseRules,
    budgetRules,
    categoryRules,
    profileUpdateRules,
};