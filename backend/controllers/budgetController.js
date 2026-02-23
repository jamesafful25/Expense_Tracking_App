const budgetService = require('../services/budgetService');

const getAll = async(req, res) => {
    try {
        const result = await budgetService.getAllBudgets(req.user.id, req.query);
        res.json(result);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};

const create = async(req, res) => {
    try {
        const budget = await budgetService.createBudget(req.body, req.user.id);
        res.status(201).json({ message: 'Budget created', budget });
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};

const update = async(req, res) => {
    try {
        const budget = await budgetService.updateBudget(req.params.id, req.body, req.user.id);
        res.json({ message: 'Budget updated', budget });
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};

const remove = async(req, res) => {
    try {
        await budgetService.deleteBudget(req.params.id, req.user.id);
        res.json({ message: 'Budget deleted' });
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};

module.exports = { getAll, create, update, remove };