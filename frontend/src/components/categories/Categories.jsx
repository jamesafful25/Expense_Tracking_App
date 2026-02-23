import { useState, useEffect, useCallback } from 'react';
import { categoriesApi } from '../../api';
import Modal from '../ui/Modal';
import Loader from '../ui/Loader';
import Toast from '../ui/Toast';
import { useToast } from '../../hooks';

const PRESET_COLORS = ['#6366f1', '#10b981', '#f97316', '#3b82f6', '#ec4899', '#8b5cf6', '#eab308', '#06b6d4', '#ef4444', '#84cc16'];
const PRESET_ICONS = ['🍽️', '🚗', '🛍️', '🎬', '🏥', '🏠', '📚', '💡', '💰', '💻', '📈', '📌', '✈️', '🎮', '🏋️', '🎁', '🐾', '💊', '📱', '🎵'];

const defaultForm = { name: '', icon: '📌', color: '#6366f1', type: 'expense' };

const Categories = () => {
  const { toasts, success, error: toastError } = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editCat, setEditCat] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [deleteId, setDeleteId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await categoriesApi.getAll();
      setCategories(data);
    } catch {
      toastError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditCat(null); setForm(defaultForm); setModalOpen(true); };
  const openEdit = (c) => { setEditCat(c); setForm({ name: c.name, icon: c.icon || '📌', color: c.color, type: c.type }); setModalOpen(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      if (editCat) {
        await categoriesApi.update(editCat.id, form);
        success('Category updated');
      } else {
        await categoriesApi.create(form);
        success('Category created');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toastError(err.message || 'Failed to save');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await categoriesApi.delete(deleteId);
      success('Category deleted');
      setDeleteId(null);
      load();
    } catch {
      toastError('Failed to delete');
    }
  };

  const change = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const userCats = categories.filter((c) => !c.isDefault);
  const defaultCats = categories.filter((c) => c.isDefault);

  return (
    <div className="space-y-6 animate-slide-up">
      <Toast toasts={toasts} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-primary-950">Categories</h1>
          <p className="text-gray-500 text-sm mt-0.5">Organize your transactions</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <span>+</span> New Category
        </button>
      </div>

      {loading ? <Loader center /> : (
        <>
          {userCats.length > 0 && (
            <div className="card">
              <h3 className="font-display font-semibold text-primary-950 mb-4">My Categories</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                {userCats.map((c) => (
                  <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-primary-200 hover:bg-primary-50 transition-all group">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0" style={{ backgroundColor: c.color + '25' }}>
                      {c.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{c.name}</p>
                      <span className="badge bg-gray-100 text-gray-500 text-xs capitalize">{c.type}</span>
                    </div>
                    <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(c)} className="text-gray-400 hover:text-primary-600">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                      <button onClick={() => setDeleteId(c.id)} className="text-gray-400 hover:text-red-500">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="card">
            <h3 className="font-display font-semibold text-primary-950 mb-4">Default Categories</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
              {defaultCats.map((c) => (
                <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0" style={{ backgroundColor: c.color + '25' }}>
                    {c.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{c.name}</p>
                    <span className="badge bg-gray-100 text-gray-400 text-xs capitalize">{c.type}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Form Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editCat ? 'Edit Category' : 'New Category'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4 items-start">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shrink-0 border-2 border-dashed" style={{ borderColor: form.color, backgroundColor: form.color + '15' }}>
              {form.icon}
            </div>
            <div className="flex-1">
              <label className="label">Name</label>
              <input className="input" value={form.name} onChange={(e) => change('name', e.target.value)} placeholder="Category name" required />
            </div>
          </div>

          <div>
            <label className="label">Icon</label>
            <div className="flex flex-wrap gap-2">
              {PRESET_ICONS.map((i) => (
                <button key={i} type="button" onClick={() => change('icon', i)}
                  className={`w-9 h-9 text-xl rounded-lg hover:bg-primary-50 transition-colors ${form.icon === i ? 'ring-2 ring-primary-400 bg-primary-50' : ''}`}>
                  {i}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Color</label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((c) => (
                <button key={c} type="button" onClick={() => change('color', c)}
                  className={`w-8 h-8 rounded-full transition-transform hover:scale-110 ${form.color === c ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''}`}
                  style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>

          <div>
            <label className="label">Type</label>
            <div className="flex gap-2">
              {['expense', 'income', 'both'].map((t) => (
                <button key={t} type="button" onClick={() => change('type', t)}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium capitalize transition-all ${form.type === t ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={formLoading} className="btn-primary flex-1">
              {formLoading ? 'Saving...' : editCat ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete confirm */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Category" size="sm">
        <p className="text-gray-600 text-sm mb-5">Delete this category? Expenses will become uncategorized.</p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteId(null)} className="btn-secondary flex-1">Cancel</button>
          <button onClick={handleDelete} className="btn-danger flex-1">Delete</button>
        </div>
      </Modal>
    </div>
  );
};

export default Categories;