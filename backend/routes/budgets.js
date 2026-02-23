const router = require('express').Router();
const budgetController = require('../controllers/budgetController');
const { authenticate } = require('../middleware/auth');
const { budgetRules } = require('../validation/rules');
const { handleValidation } = require('../validation/handler');

router.use(authenticate);

router.get('/', budgetController.getAll);
router.post('/', budgetRules, handleValidation, budgetController.create);
router.put('/:id', budgetRules, handleValidation, budgetController.update);
router.delete('/:id', budgetController.remove);

module.exports = router;