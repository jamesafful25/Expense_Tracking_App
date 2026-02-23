const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Budget = sequelize.define(
    'Budget', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING(150),
            allowNull: false,
        },
        amount: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
        },
        spent: {
            type: DataTypes.DECIMAL(12, 2),
            defaultValue: 0,
        },
        period: {
            type: DataTypes.ENUM('daily', 'weekly', 'monthly', 'yearly'),
            defaultValue: 'monthly',
        },
        startDate: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            field: 'start_date',
        },
        endDate: {
            type: DataTypes.DATEONLY,
            allowNull: true,
            field: 'end_date',
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'user_id',
        },
        categoryId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'category_id',
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            field: 'is_active',
        },
    }, {
        tableName: 'budgets',
        timestamps: true,
        underscored: true,
    }
);

module.exports = Budget;