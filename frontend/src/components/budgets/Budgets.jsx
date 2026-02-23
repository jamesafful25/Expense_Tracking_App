import { useState, useEffect, useCallback } from 'react';
import { budgetsApi, categoriesApi } from '../../api';
import { formatCurrency } from '../../utils';
import Modal from '../ui/Modal';
import Loader from '../ui/Loader';
import Pagination from '../ui/Pagination';
import Toast from '../ui/Toast';
import { useToast } from '../../hooks';

const defaultForm = {
  name: '',
  amount: '',
  period: 'monthly',
  startDate: new Date().toISOString().split('T')[0],
  endDate: '',
  categoryId: '',
};

const Budgets = () => {
  const { toasts, success, error: toastError } = useToast();
  const [budgets, setBudgets] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editBudget, setEditBudget] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await budgetsApi.getAll({ page });
      setBudgets(result.data || []);
      setPagination(result.pagination);
    } catch {
      toastError('Failed to load budgets');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { categoriesApi.getAll().then(setCategories).catch(() => {}); }, []);

  const openCreate = () => { setEditBudget(null); setForm(defaultForm); setModalOpen(true); };
  const openEdit = (b) => {
    setEditBudget(b);
    setForm({ name: b.name, amount: b.amount, period: b.period, startDate: b.startDate, endDate: b.endDate || '', categoryId: b.categoryId || '' });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      if (editBudget) {
        await budgetsApi.update(editBudget.id, form);
        success('Budget updated');
      } else {
        await budgetsApi.create(form);
        success('Budget created');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toastError(err.message || 'Failed to save');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this budget?')) return;
    try {
      await budgetsApi.delete(id);
      success('Budget deleted');
      load();
    } catch {
      toastError('Failed to delete');
    }
  };

  const change = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const getProgressColor = (pct) => {
    if (pct >= 100) return 'bg-red-500';
    if (pct >= 80) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <Toast toasts={toasts} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-primary-950">Budgets</h1>
          <p className="text-gray-500 text-sm mt-0.5">Set spending limits and track progress</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <span>+</span> New Budget
        </button>
      </div>

      {loading ? <Loader center /> : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {budgets.length === 0 ? (
              <div className="col-span-3 card text-center py-12 text-gray-400">
                <p className="text-4xl mb-3">🎯</p>
                <p className="font-medium">No budgets yet</p>
                <p className="text-sm">Create a budget to track your spending</p>
              </div>
            ) : budgets.map((b) => {
              const pct = Math.min((b.spent / b.amount) * 100, 100);
              const remaining = parseFloat(b.amount) - parseFloat(b.spent || 0);
              return (
                <div key={b.id} className="card hover:shadow-card-hover transition-shadow duration-300">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-800">{b.name}</h3>
                      <span className="badge bg-primary-50 text-primary-600 mt-1 capitalize">{b.period}</span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(b)} className="text-gray-400 hover:text-primary-600 transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                      <button onClick={() => handleDelete(b.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                      <span>Spent: <span className="font-semibold text-gray-700">{formatCurrency(b.spent || 0)}</span></span>
                      <span>Budget: <span className="font-semibold text-gray-700">{formatCurrency(b.amount)}</span></span>
                    </div>
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${getProgressColor(pct)}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-1.5 text-xs">
                      <span className={`font-medium ${pct >= 100 ? 'text-red-500' : 'text-emerald-600'}`}>{pct.toFixed(0)}% used</span>
                      <span className={`font-medium ${remaining < 0 ? 'text-red-500' : 'text-gray-500'}`}>
                        {remaining >= 0 ? `${formatCurrency(remaining)} left` : `${formatCurrency(Math.abs(remaining))} over`}
                      </span>
                    </div>
                  </div>

                  {b.category && (
                    <div className="text-xs text-gray-400">{b.category.icon} {b.category.name}</div>
                  )}
                </div>
              );
            })}
          </div>
          {pagination && <Pagination pagination={pagination} onPageChange={setPage} />}
        </>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editBudget ? 'Edit Budget' : 'New Budget'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Budget Name</label>
            <input className="input" name="name" value={form.name} onChange={change} placeholder="e.g. Monthly Food Budget" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Amount</label>
              <input className="input font-mono" name="amount" type="number" min="0.01" step="0.01" value={form.amount} onChange={change} required />
            </div>
            <div>
              <label className="label">Period</label>
              <select className="input" name="period" value={form.period} onChange={change}>
                {['daily', 'weekly', 'monthly', 'yearly'].map((p) => (
                  <option key={p} value={p} className="capitalize">{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Start Date</label>
              <input className="input" name="startDate" type="date" value={form.startDate} onChange={change} required />
            </div>
            <div>
              <label className="label">End Date (optional)</label>
              <input className="input" name="endDate" type="date" value={form.endDate} onChange={change} />
            </div>
          </div>
          <div>
            <label className="label">Category (optional)</label>
            <select className="input" name="categoryId" value={form.categoryId} onChange={change}>
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={formLoading} className="btn-primary flex-1">
              {formLoading ? 'Saving...' : editBudget ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Budgets;