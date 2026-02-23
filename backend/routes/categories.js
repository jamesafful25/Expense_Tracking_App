const router = require('express').Router();
const categoryController = require('../controllers/categoryController');
const { authenticate } = require('../middleware/auth');
const { categoryRules } = require('../validation/rules');
const { handleValidation } = require('../validation/handler');

router.use(authenticate);

router.get('/', categoryController.getAll);
router.get('/:id', categoryController.getOne);
router.post('/', categoryRules, handleValidation, categoryController.create);
router.put('/:id', categoryRules, handleValidation, categoryController.update);
router.delete('/:id', categoryController.remove);

module.exports = router;