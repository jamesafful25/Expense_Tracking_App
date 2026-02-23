const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const REPORTS_DIR = path.join(__dirname, '../reports');

const ensureReportsDir = function() {
    if (!fs.existsSync(REPORTS_DIR)) {
        fs.mkdirSync(REPORTS_DIR, { recursive: true });
    }
};

const generateExpenseExcel = function(expenses, user, filters) {
    filters = filters || {};
    ensureReportsDir();

    const fileName = 'expense_report_' + user.id + '_' + Date.now() + '.xlsx';
    const filePath = path.join(REPORTS_DIR, fileName);

    const workbook = XLSX.utils.book_new();

    const totalExpenses = expenses
        .filter(function(e) { return e.type === 'expense'; })
        .reduce(function(sum, e) { return sum + parseFloat(e.amount); }, 0);
    const totalIncome = expenses
        .filter(function(e) { return e.type === 'income'; })
        .reduce(function(sum, e) { return sum + parseFloat(e.amount); }, 0);

    const summaryData = [
        ['Expense Tracker Report'],
        [''],
        ['User:', user.name],
        ['Email:', user.email],
        ['Currency:', user.currency || 'USD'],
        ['Generated:', new Date().toLocaleString()],
        ['Period:', (filters.startDate || 'All time') + ' - ' + (filters.endDate || 'Present')],
        [''],
        ['Summary'],
        ['Total Expenses:', totalExpenses.toFixed(2)],
        ['Total Income:', totalIncome.toFixed(2)],
        ['Net Balance:', (totalIncome - totalExpenses).toFixed(2)],
        ['Total Records:', expenses.length],
    ];

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    summarySheet['!cols'] = [{ wch: 20 }, { wch: 30 }];
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

    // utils = a built-in helper section inside the XLSX library
    // aoa_to_sheet = a function inside the utils section : aoa "Array Of Arrays"

    const headers = ['ID', 'Date', 'Title', 'Amount', 'Type', 'Category', 'Payment Method', 'Notes', 'Tags'];

    const rows = expenses.map(function(e) {
        const catName = (e.category && e.category.name) ? e.category.name : 'Uncategorized';
        const tags = Array.isArray(e.tags) ? e.tags.join(', ') : '';
        return [
            e.id,
            e.date,
            e.title,
            parseFloat(e.amount),
            e.type,
            catName,
            e.paymentMethod || 'N/A',
            e.notes || '',
            tags,
        ];
    });

    const expenseSheet = XLSX.utils.aoa_to_sheet([headers].concat(rows));
    expenseSheet['!cols'] = [
        { wch: 6 }, { wch: 12 }, { wch: 30 }, { wch: 12 },
        { wch: 10 }, { wch: 18 }, { wch: 16 }, { wch: 30 }, { wch: 20 },
    ];
    XLSX.utils.book_append_sheet(workbook, expenseSheet, 'Transactions');

    const categoryMap = {};
    expenses.forEach(function(e) {
        const cat = (e.category && e.category.name) ? e.category.name : 'Uncategorized';
        if (!categoryMap[cat]) categoryMap[cat] = { expense: 0, income: 0, count: 0 };
        categoryMap[cat][e.type] += parseFloat(e.amount);
        categoryMap[cat].count++;
    });

    const catHeaders = ['Category', 'Total Expenses', 'Total Income', 'Count'];
    const catRows = Object.entries(categoryMap).map(function(entry) {
        return [entry[0], entry[1].expense.toFixed(2), entry[1].income.toFixed(2), entry[1].count];
    });

    const catSheet = XLSX.utils.aoa_to_sheet([catHeaders].concat(catRows));
    catSheet['!cols'] = [{ wch: 20 }, { wch: 16 }, { wch: 14 }, { wch: 8 }];
    XLSX.utils.book_append_sheet(workbook, catSheet, 'By Category');

    XLSX.writeFile(workbook, filePath);

    return { fileName: fileName, filePath: filePath };
};

module.exports = { generateExpenseExcel };