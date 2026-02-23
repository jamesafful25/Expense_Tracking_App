const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Expense = sequelize.define(
    'Expense', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        title: {
            type: DataTypes.STRING(200),
            allowNull: false,
        },
        amount: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
        },
        type: {
            type: DataTypes.ENUM('expense', 'income'),
            allowNull: false,
            defaultValue: 'expense',
        },
        date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        receipt: {
            type: DataTypes.STRING(500),
            allowNull: true,
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
        paymentMethod: {
            type: DataTypes.ENUM('cash', 'card', 'bank_transfer', 'mobile_money', 'other'),
            defaultValue: 'cash',
            field: 'payment_method',
        },
        tags: {
            type: DataTypes.JSON,
            allowNull: true,
        },
    }, {
        tableName: 'expenses',
        timestamps: true,
        underscored: true,
    }
);

module.exports = Expense;