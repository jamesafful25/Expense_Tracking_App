const expenseService = require('../services/expenseService');
const path = require('path');

const getAll = async(req, res) => {
    try {
        const result = await expenseService.getAllExpenses(req.user.id, req.query);
        res.json(result);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};

const getOne = async(req, res) => {
    try {
        const expense = await expenseService.getExpenseById(req.params.id, req.user.id);
        res.json(expense);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};

const create = async(req, res) => {
    try {
        const file = req.files && req.files.receipt ? req.files.receipt : null;
        const expense = await expenseService.createExpense(req.body, req.user.id, file);
        res.status(201).json({ message: 'Expense created', expense });
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};

const update = async(req, res) => {
    try {
        const file = req.files && req.files.receipt ? req.files.receipt : null;
        const expense = await expenseService.updateExpense(req.params.id, req.body, req.user.id, file);
        res.json({ message: 'Expense updated', expense });
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};

const remove = async(req, res) => {
    try {
        await expenseService.deleteExpense(req.params.id, req.user.id);
        res.json({ message: 'Expense deleted' });
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};

const getSummary = async(req, res) => {
    try {
        const summary = await expenseService.getSummary(req.user.id, req.query);
        res.json(summary);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};

const exportReport = async(req, res) => {
    try {
        const format = req.query.format || 'pdf';
        const { fileName, filePath } = await expenseService.exportReport(
            req.user.id,
            req.user,
            req.query,
            format
        );

        const mimeType = format === 'excel' ?
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' :
            'application/pdf';

        res.setHeader('Content-Disposition', 'attachment; filename="' + fileName + '"');
        res.setHeader('Content-Type', mimeType);
        res.sendFile(path.resolve(filePath));
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};

module.exports = { getAll, getOne, create, update, remove, getSummary, exportReport };