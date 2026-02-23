const categoryService = require('../services/categoryService');

const getAll = async(req, res) => {
    try {
        const categories = await categoryService.getAllCategories(req.user.id);
        res.json(categories);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};

const getOne = async(req, res) => {
    try {
        const category = await categoryService.getCategoryById(req.params.id, req.user.id);
        res.json(category);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};

const create = async(req, res) => {
    try {
        const category = await categoryService.createCategory(req.body, req.user.id);
        res.status(201).json({ message: 'Category created', category });
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};

const update = async(req, res) => {
    try {
        const category = await categoryService.updateCategory(req.params.id, req.body, req.user.id);
        res.json({ message: 'Category updated', category });
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};

const remove = async(req, res) => {
    try {
        await categoryService.deleteCategory(req.params.id, req.user.id);
        res.json({ message: 'Category deleted' });
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};

module.exports = { getAll, getOne, create, update, remove };