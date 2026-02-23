const router = require('express').Router();
const expenseController = require('../controllers/expenseController');
const { authenticate } = require('../middleware/auth');
const { expenseRules } = require('../validation/rules');
const { handleValidation } = require('../validation/handler');

router.use(authenticate);

router.get('/summary', expenseController.getSummary);
router.get('/export', expenseController.exportReport);
router.get('/', expenseController.getAll);
router.get('/:id', expenseController.getOne);
router.post('/', expenseRules, handleValidation, expenseController.create);
router.put('/:id', expenseRules, handleValidation, expenseController.update);
router.delete('/:id', expenseController.remove);

module.exports = router;