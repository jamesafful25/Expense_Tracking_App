const { Op } = require('sequelize');
const { Category } = require('../models');

const DEFAULT_CATEGORIES = [
    { name: 'Food & Dining', icon: '🍽️', color: '#f97316', type: 'expense', isDefault: true },
    { name: 'Transportation', icon: '🚗', color: '#3b82f6', type: 'expense', isDefault: true },
    { name: 'Shopping', icon: '🛍️', color: '#ec4899', type: 'expense', isDefault: true },
    { name: 'Entertainment', icon: '🎬', color: '#8b5cf6', type: 'expense', isDefault: true },
    { name: 'Health', icon: '🏥', color: '#10b981', type: 'expense', isDefault: true },
    { name: 'Housing', icon: '🏠', color: '#6366f1', type: 'expense', isDefault: true },
    { name: 'Education', icon: '📚', color: '#0891b2', type: 'expense', isDefault: true },
    { name: 'Utilities', icon: '💡', color: '#eab308', type: 'expense', isDefault: true },
    { name: 'Salary', icon: '💰', color: '#22c55e', type: 'income', isDefault: true },
    { name: 'Freelance', icon: '💻', color: '#06b6d4', type: 'income', isDefault: true },
    { name: 'Investment', icon: '📈', color: '#a855f7', type: 'income', isDefault: true },
    { name: 'Other', icon: '📌', color: '#9ca3af', type: 'both', isDefault: true },
];

const seedDefaultCategories = async() => {
    for (const cat of DEFAULT_CATEGORIES) {
        await Category.findOrCreate({
            where: { name: cat.name, isDefault: true },
            defaults: cat,
        });
    }
};

const getAllCategories = async(userId) => {
    return Category.findAll({
        where: {
            [Op.or]: [{ userId }, { isDefault: true }],
        },
        order: [
            ['isDefault', 'DESC'],
            ['name', 'ASC']
        ],
    });
};

const getCategoryById = async(id, userId) => {
    const cat = await Category.findOne({
        where: { id, [Op.or]: [{ userId }, { isDefault: true }] },
    });
    if (!cat) {
        const error = new Error('Category not found');
        error.statusCode = 404;
        throw error;
    }
    return cat;
};

const createCategory = async(data, userId) => {
    return Category.create({...data, userId });
};

const updateCategory = async(id, data, userId) => {
    const cat = await Category.findOne({ where: { id, userId } });
    if (!cat) {
        const error = new Error('Category not found or not editable');
        error.statusCode = 404;
        throw error;
    }
    await cat.update(data);
    return cat;
};

const deleteCategory = async(id, userId) => {
    const cat = await Category.findOne({ where: { id, userId } });
    if (!cat) {
        const error = new Error('Category not found or not deletable');
        error.statusCode = 404;
        throw error;
    }
    await cat.destroy();
};

module.exports = {
    seedDefaultCategories,
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
};