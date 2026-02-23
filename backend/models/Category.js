const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Category = sequelize.define(
    'Category', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        icon: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        color: {
            type: DataTypes.STRING(20),
            defaultValue: '#6366f1',
        },
        type: {
            type: DataTypes.ENUM('expense', 'income', 'both'),
            defaultValue: 'expense',
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'user_id',
        },
        isDefault: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            field: 'is_default',
        },
    }, {
        tableName: 'categories',
        timestamps: true,
        underscored: true,
    }
);

module.exports = Category;