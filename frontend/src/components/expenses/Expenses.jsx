import { useState, useEffect, useCallback } from 'react';
import { expensesApi, categoriesApi } from '../../api';
import { formatCurrency, formatDate } from '../../utils';
import Modal from '../ui/Modal';
import Loader from '../ui/Loader';
import Pagination from '../ui/Pagination';
import ExpenseForm from './ExpenseForm';
import Toast from '../ui/Toast';
import { useToast } from '../../hooks';

const Expenses = () => {
  const { toasts, success, error: toastError } = useToast();
  const [expenses, setExpenses] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editExpense, setEditExpense] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [filters, setFilters] = useState({ type: '', categoryId: '', search: '', page: 1 });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''));
      const result = await expensesApi.getAll(params);
      setExpenses(result.data || []);
      setPagination(result.pagination);
    } catch {
      toastError('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    categoriesApi.getAll().then(setCategories).catch(() => {});
  }, []);

  const handleSubmit = async (payload, isFormData) => {
    setFormLoading(true);
    try {
      if (editExpense) {
        await (isFormData
          ? expensesApi.updateWithFile(editExpense.id, payload)
          : expensesApi.update(editExpense.id, payload));
        success('Expense updated');
      } else {
        await (isFormData
          ? expensesApi.createWithFile(payload)
          : expensesApi.create(payload));
        success('Expense added');
      }
      setModalOpen(false);
      setEditExpense(null);
      load();
    } catch (err) {
      toastError(err.message || 'Failed to save');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await expensesApi.delete(deleteId);
      success('Expense deleted');
      setDeleteId(null);
      load();
    } catch {
      toastError('Failed to delete');
    }
  };

  const filterChange = (key, val) => setFilters((f) => ({ ...f, [key]: val, page: 1 }));

  return (
    <div className="space-y-6 animate-slide-up">
      <Toast toasts={toasts} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-primary-950">Expenses</h1>
          <p className="text-gray-500 text-sm mt-0.5">Track your income & expenses</p>
        </div>
        <button onClick={() => { setEditExpense(null); setModalOpen(true); }} className="btn-primary flex items-center gap-2">
          <span>+</span> Add Transaction
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-3">
          <input
            className="input w-48"
            placeholder="🔍 Search..."
            value={filters.search}
            onChange={(e) => filterChange('search', e.target.value)}
          />
          <select className="input w-36" value={filters.type} onChange={(e) => filterChange('type', e.target.value)}>
            <option value="">All Types</option>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
          <select className="input w-44" value={filters.categoryId} onChange={(e) => filterChange('categoryId', e.target.value)}>
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
            ))}
          </select>
          <input
            className="input w-36"
            type="date"
            value={filters.startDate || ''}
            onChange={(e) => filterChange('startDate', e.target.value)}
          />
          <input
            className="input w-36"
            type="date"
            value={filters.endDate || ''}
            onChange={(e) => filterChange('endDate', e.target.value)}
          />
          {Object.values(filters).some((v) => v && v !== 1) && (
            <button onClick={() => setFilters({ type: '', categoryId: '', search: '', page: 1 })} className="btn-secondary text-sm">
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Transaction</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Method</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-5 py-3.5"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="py-12 text-center"><Loader center /></td></tr>
              ) : expenses.length === 0 ? (
                <tr><td colSpan={6} className="py-12 text-center text-gray-400">No transactions found</td></tr>
              ) : (
                expenses.map((e) => (
                  <tr key={e.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: (e.category?.color || '#6366f1') + '20' }}>
                          <span className="text-base">{e.category?.icon || '📌'}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{e.title}</p>
                          {e.notes && <p className="text-xs text-gray-400 truncate max-w-xs">{e.notes}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="badge bg-primary-50 text-primary-700">{e.category?.name || 'Uncategorized'}</span>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500">{formatDate(e.date)}</td>
                    <td className="px-5 py-4 text-sm text-gray-500 capitalize">{e.paymentMethod?.replace('_', ' ')}</td>
                    <td className="px-5 py-4 text-right">
                      <span className={`font-mono font-semibold text-sm ${e.type === 'income' ? 'text-emerald-600' : 'text-red-500'}`}>
                        {e.type === 'income' ? '+' : '-'}{formatCurrency(e.amount)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 justify-end">
                        {e.receipt && (
                          <a href={`/${e.receipt}`} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-primary-600 transition-colors" title="View receipt">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                          </a>
                        )}
                        <button onClick={() => { setEditExpense(e); setModalOpen(true); }} className="text-gray-400 hover:text-primary-600 transition-colors">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        <button onClick={() => setDeleteId(e.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {pagination && (
          <div className="px-5 py-4 border-t border-gray-100">
            <Pagination pagination={pagination} onPageChange={(p) => setFilters((f) => ({ ...f, page: p }))} />
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditExpense(null); }}
        title={editExpense ? 'Edit Transaction' : 'Add Transaction'}
        size="lg"
      >
        <ExpenseForm
          onSubmit={handleSubmit}
          onCancel={() => { setModalOpen(false); setEditExpense(null); }}
          initialData={editExpense}
          loading={formLoading}
        />
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Transaction" size="sm">
        <p className="text-gray-600 text-sm mb-5">Are you sure you want to delete this transaction? This cannot be undone.</p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteId(null)} className="btn-secondary flex-1">Cancel</button>
          <button onClick={handleDelete} className="btn-danger flex-1">Delete</button>
        </div>
      </Modal>
    </div>
  );
};

export default Expenses;