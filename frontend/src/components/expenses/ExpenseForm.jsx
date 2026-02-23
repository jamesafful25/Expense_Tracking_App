import { useState, useEffect } from 'react';
import { categoriesApi } from '../../api';
import { PAYMENT_METHODS } from '../../utils';

const defaultForm = {
  title: '',
  amount: '',
  type: 'expense',
  date: new Date().toISOString().split('T')[0],
  categoryId: '',
  paymentMethod: 'cash',
  notes: '',
  tags: '',
};

const ExpenseForm = ({ onSubmit, onCancel, initialData, loading }) => {
  const [form, setForm] = useState(defaultForm);
  const [categories, setCategories] = useState([]);
  const [file, setFile] = useState(null);

  useEffect(() => {
    categoriesApi.getAll().then(setCategories).catch(console.error);
  }, []);

  useEffect(() => {
    if (initialData) {
      setForm({
        ...defaultForm,
        ...initialData,
        categoryId: initialData.categoryId || '',
        tags: Array.isArray(initialData.tags) ? initialData.tags.join(', ') : '',
      });
    } else {
      setForm(defaultForm);
    }
  }, [initialData]);

  const change = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleFileChange = (e) => {
    const selected = e.target.files && e.target.files[0] ? e.target.files[0] : null;
    setFile(selected);
  };

  const removeFile = () => {
    setFile(null);
    const input = document.getElementById('receipt-input');
    if (input) input.value = '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      title: form.title.trim(),
      amount: form.amount,
      type: form.type,
      date: form.date,
      paymentMethod: form.paymentMethod || 'cash',
    };

    if (form.categoryId) payload.categoryId = form.categoryId;
    if (form.notes && form.notes.trim()) payload.notes = form.notes.trim();
    if (form.tags && form.tags.trim()) {
      payload.tags = form.tags.split(',').map((t) => t.trim()).filter(Boolean);
    }

    if (file) {
      const fd = new FormData();
      fd.append('title', payload.title);
      fd.append('amount', payload.amount);
      fd.append('type', payload.type);
      fd.append('date', payload.date);
      fd.append('paymentMethod', payload.paymentMethod);
      if (payload.categoryId) fd.append('categoryId', payload.categoryId);
      if (payload.notes) fd.append('notes', payload.notes);
      if (payload.tags) fd.append('tags', JSON.stringify(payload.tags));
      fd.append('receipt', file);
      onSubmit(fd, true);
    } else {
      onSubmit(payload, false);
    }
  };

  const filteredCategories = categories.filter(
    (c) => c.type === form.type || c.type === 'both'
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* Type Toggle */}
      <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
        {['expense', 'income'].map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setForm((f) => ({ ...f, type: t, categoryId: '' }))}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200 capitalize ${
              form.type === t
                ? t === 'expense'
                  ? 'bg-red-500 text-white shadow'
                  : 'bg-emerald-500 text-white shadow'
                : 'text-gray-500'
            }`}
          >
            {t === 'expense' ? '💸 ' : '💵 '}{t}
          </button>
        ))}
      </div>

      {/* Title */}
      <div>
        <label className="label">Title *</label>
        <input
          className="input"
          name="title"
          value={form.title}
          onChange={change}
          placeholder="e.g. Grocery shopping"
          required
        />
      </div>

      {/* Amount + Date */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Amount *</label>
          <input
            className="input font-mono"
            name="amount"
            type="number"
            min="0.01"
            step="0.01"
            value={form.amount}
            onChange={change}
            placeholder="0.00"
            required
          />
        </div>
        <div>
          <label className="label">Date *</label>
          <input
            className="input"
            name="date"
            type="date"
            value={form.date}
            onChange={change}
            required
          />
        </div>
      </div>

      {/* Category + Payment */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Category</label>
          <select className="input" name="categoryId" value={form.categoryId} onChange={change}>
            <option value="">No category</option>
            {filteredCategories.map((c) => (
              <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Payment Method</label>
          <select className="input" name="paymentMethod" value={form.paymentMethod} onChange={change}>
            {PAYMENT_METHODS.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="label">Tags <span className="text-gray-400 font-normal text-xs">(comma separated, optional)</span></label>
        <input
          className="input"
          name="tags"
          value={form.tags}
          onChange={change}
          placeholder="e.g. work, travel, personal"
        />
      </div>

      {/* Notes */}
      <div>
        <label className="label">Notes <span className="text-gray-400 font-normal text-xs">(optional)</span></label>
        <textarea
          className="input resize-none"
          name="notes"
          value={form.notes}
          onChange={change}
          rows={2}
          placeholder="Add any extra details..."
        />
      </div>

      {/* File upload — NOT inside a <label> to avoid browser conflicts */}
      <div>
        <label className="label">Receipt <span className="text-gray-400 font-normal text-xs">(optional — JPEG, PNG, PDF, max 10MB)</span></label>
        <div className="flex items-center gap-3 border-2 border-dashed border-primary-200 rounded-xl p-3 bg-gray-50">
          <span className="text-xl">📎</span>
          <div className="flex-1 min-w-0">
            {file ? (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 truncate">{file.name}</span>
                <button
                  type="button"
                  onClick={removeFile}
                  className="text-red-400 text-xs ml-2 shrink-0"
                >
                  ✕ Remove
                </button>
              </div>
            ) : (
              <span className="text-sm text-gray-400">No file chosen</span>
            )}
          </div>
          <input
            id="receipt-input"
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp,application/pdf"
            onChange={handleFileChange}
            className="block text-xs text-gray-500 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-primary-100 file:text-primary-700 cursor-pointer"
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-2 border-t border-gray-100">
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary flex-1"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="btn-primary flex-1"
        >
          {loading ? 'Saving...' : initialData ? 'Update Expense' : 'Add Expense'}
        </button>
      </div>

    </form>
  );
};

export default ExpenseForm;