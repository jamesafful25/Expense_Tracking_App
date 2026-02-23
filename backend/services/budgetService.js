const { Op } = require('sequelize');
const { Budget, Category, Expense } = require('../models');
const { paginatedResponse, sequelizePagination } = require('../pagination');

const getAllBudgets = async(userId, query) => {
    const { page, limit, sequelizeOptions } = sequelizePagination(query);

    const where = { userId };
    if (query.isActive !== undefined) where.isActive = query.isActive === 'true';

    const { count, rows } = await Budget.findAndCountAll({
        where,
        include: [{ model: Category, as: 'category', attributes: ['id', 'name', 'color', 'icon'] }],
        order: [
            ['createdAt', 'DESC']
        ],
        ...sequelizeOptions,
    });

    // Calculate spent for each budget
    const budgetsWithSpent = await Promise.all(
        rows.map(async(budget) => {
            const expWhere = {
                userId,
                type: 'expense',
                date: {
                    [Op.between]: [budget.startDate, budget.endDate || new Date()] },
            };
            if (budget.categoryId) expWhere.categoryId = budget.categoryId;

            const result = await Expense.sum('amount', { where: expWhere });
            const spent = parseFloat(result || 0);
            const plain = budget.toJSON();
            return {...plain, spent, remaining: parseFloat(budget.amount) - spent };
        })
    );

    return paginatedResponse(budgetsWithSpent, count, page, limit);
};

const createBudget = async(data, userId) => {
    return Budget.create({...data, userId });
};

const updateBudget = async(id, data, userId) => {
    const budget = await Budget.findOne({ where: { id, userId } });
    if (!budget) {
        const error = new Error('Budget not found');
        error.statusCode = 404;
        throw error;
    }
    await budget.update(data);
    return budget;
};

const deleteBudget = async(id, userId) => {
    const budget = await Budget.findOne({ where: { id, userId } });
    if (!budget) {
        const error = new Error('Budget not found');
        error.statusCode = 404;
        throw error;
    }
    await budget.destroy();
};

module.exports = { getAllBudgets, createBudget, updateBudget, deleteBudget };