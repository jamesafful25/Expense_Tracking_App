const User = require('./User');
const Category = require('./Category');
const Expense = require('./Expense');
const Budget = require('./Budget');

// User associations
User.hasMany(Expense, { foreignKey: 'userId', as: 'expenses' });
User.hasMany(Category, { foreignKey: 'userId', as: 'categories' });
User.hasMany(Budget, { foreignKey: 'userId', as: 'budgets' });

// Category associations
Category.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Category.hasMany(Expense, { foreignKey: 'categoryId', as: 'expenses' });
Category.hasMany(Budget, { foreignKey: 'categoryId', as: 'budgets' });

// Expense associations
Expense.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Expense.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

// Budget associations
Budget.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Budget.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

module.exports = { User, Category, Expense, Budget };