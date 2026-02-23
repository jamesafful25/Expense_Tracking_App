const { Op } = require('sequelize');
const { Expense, Category } = require('../models');
const { paginatedResponse, sequelizePagination } = require('../pagination');
const { uploadFile, deleteFile } = require('../utils/fileUpload');
const { generateExpensePDF } = require('../utils/reports/pdfReport');
const { generateExpenseExcel } = require('../utils/reports/excelReport');

// Safely parse tags - handles array, JSON string, comma string, or undefined
const parseTags = function(tags) {
    if (!tags) return [];
    if (Array.isArray(tags)) return tags;
    try {
        const parsed = JSON.parse(tags);
        if (Array.isArray(parsed)) return parsed;
    } catch (e) {
        // not JSON, treat as comma-separated
    }
    if (typeof tags === 'string') {
        return tags.split(',').map(function(t) { return t.trim(); }).filter(Boolean);
    }
    return [];
};

// Sanitize incoming expense data
const sanitizeData = function(data) {
    const clean = {};
    if (data.title !== undefined) clean.title = data.title;
    if (data.amount !== undefined) clean.amount = parseFloat(data.amount);
    if (data.type !== undefined) clean.type = data.type;
    if (data.date !== undefined) clean.date = data.date;
    if (data.notes !== undefined) clean.notes = data.notes || null;
    if (data.paymentMethod !== undefined) clean.paymentMethod = data.paymentMethod || 'cash';
    if (data.tags !== undefined) clean.tags = parseTags(data.tags);

    // categoryId: only set if it's a valid number
    if (data.categoryId !== undefined && data.categoryId !== '' && data.categoryId !== null) {
        const catId = parseInt(data.categoryId);
        if (!isNaN(catId) && catId > 0) clean.categoryId = catId;
    }

    return clean;
};

const buildFilters = function(query, userId) {
    const where = { userId: userId };

    if (query.type) where.type = query.type;
    if (query.categoryId) where.categoryId = parseInt(query.categoryId);
    if (query.paymentMethod) where.paymentMethod = query.paymentMethod;

    if (query.startDate || query.endDate) {
        where.date = {};
        if (query.startDate) where.date[Op.gte] = query.startDate;
        if (query.endDate) where.date[Op.lte] = query.endDate;
    }

    if (query.search) {
        where.title = {
            [Op.like]: '%' + query.search + '%' };
    }

    return where;
};

const getAllExpenses = async function(userId, query) {
    const { page, limit, sequelizeOptions } = sequelizePagination(query);
    const where = buildFilters(query, userId);

    const { count, rows } = await Expense.findAndCountAll({
        where: where,
        include: [{ model: Category, as: 'category', attributes: ['id', 'name', 'color', 'icon'] }],
        order: [
            ['date', 'DESC'],
            ['createdAt', 'DESC']
        ],
        ...sequelizeOptions,
    });

    return paginatedResponse(rows, count, page, limit);
};

const getExpenseById = async function(id, userId) {
    const expense = await Expense.findOne({
        where: { id: id, userId: userId },
        include: [{ model: Category, as: 'category' }],
    });

    if (!expense) {
        const error = new Error('Expense not found');
        error.statusCode = 404;
        throw error;
    }
    return expense;
};

const createExpense = async function(data, userId, file) {
    const clean = sanitizeData(data);

    if (file) {
        clean.receipt = uploadFile(file);
    }

    clean.userId = userId;

    const expense = await Expense.create(clean);
    return getExpenseById(expense.id, userId);
};

const updateExpense = async function(id, data, userId, file) {
    const expense = await getExpenseById(id, userId);
    const clean = sanitizeData(data);

    if (file) {
        if (expense.receipt) deleteFile(expense.receipt);
        clean.receipt = uploadFile(file);
    }

    await expense.update(clean);
    return getExpenseById(id, userId);
};

const deleteExpense = async function(id, userId) {
    const expense = await getExpenseById(id, userId);
    if (expense.receipt) deleteFile(expense.receipt);
    await expense.destroy();
};

const getSummary = async function(userId, query) {
    const where = buildFilters(query, userId);

    const expenses = await Expense.findAll({
        where: where,
        include: [{ model: Category, as: 'category', attributes: ['id', 'name', 'color'] }],
        order: [
            ['date', 'DESC']
        ],
    });

    const totalExpense = expenses
        .filter(function(e) { return e.type === 'expense'; })
        .reduce(function(s, e) { return s + parseFloat(e.amount); }, 0);

    const totalIncome = expenses
        .filter(function(e) { return e.type === 'income'; })
        .reduce(function(s, e) { return s + parseFloat(e.amount); }, 0);

    const byCategory = {};
    expenses.forEach(function(e) {
        const catKey = (e.category && e.category.id) ? e.category.id : 'uncategorized';
        const catName = (e.category && e.category.name) ? e.category.name : 'Uncategorized';
        const catColor = (e.category && e.category.color) ? e.category.color : '#9ca3af';
        if (!byCategory[catKey]) {
            byCategory[catKey] = { id: catKey, name: catName, color: catColor, expense: 0, income: 0 };
        }
        byCategory[catKey][e.type] += parseFloat(e.amount);
    });

    const byMonth = {};
    expenses.forEach(function(e) {
        const month = e.date.substring(0, 7);
        if (!byMonth[month]) byMonth[month] = { month: month, expense: 0, income: 0 };
        byMonth[month][e.type] += parseFloat(e.amount);
    });

    return {
        totalExpense: totalExpense,
        totalIncome: totalIncome,
        netBalance: totalIncome - totalExpense,
        totalCount: expenses.length,
        byCategory: Object.values(byCategory),
        byMonth: Object.values(byMonth).sort(function(a, b) { return a.month.localeCompare(b.month); }),
    };
};

const exportReport = async function(userId, user, query, format) {
    const where = buildFilters(query, userId);
    const expenses = await Expense.findAll({
        where: where,
        include: [{ model: Category, as: 'category', attributes: ['id', 'name'] }],
        order: [
            ['date', 'DESC']
        ],
    });

    if (format === 'excel') {
        return generateExpenseExcel(expenses, user, query);
    }
    return generateExpensePDF(expenses, user, query);
};

module.exports = {
    getAllExpenses,
    getExpenseById,
    createExpense,
    updateExpense,
    deleteExpense,
    getSummary,
    exportReport,
};