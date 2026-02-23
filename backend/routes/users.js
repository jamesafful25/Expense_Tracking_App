const router = require('express').Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');
const { profileUpdateRules } = require('../validation/rules');
const { handleValidation } = require('../validation/handler');
const { body } = require('express-validator');

router.use(authenticate);

router.get('/profile', userController.getProfile);
router.put('/profile', profileUpdateRules, handleValidation, userController.updateProfile);
router.put(
    '/change-password', [
        body('currentPassword').notEmpty().withMessage('Current password is required'),
        body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
    ],
    handleValidation,
    userController.changePassword
);

module.exports = router;