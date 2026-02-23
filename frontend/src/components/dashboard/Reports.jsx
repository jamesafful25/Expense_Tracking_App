import { useState } from 'react';
import Toast from '../ui/Toast';
import { useToast } from '../../hooks';

const Reports = () => {
  const { toasts, success, error: toastError } = useToast();
  const [filters, setFilters] = useState({ startDate: '', endDate: '', type: '' });
  const [exporting, setExporting] = useState('');

  const change = (e) => setFilters((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleExport = async (format) => {
    setExporting(format);
    try {
      const token = localStorage.getItem('token');

      // Build query params - only include non-empty values
      const params = { format };
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.type) params.type = filters.type;

      const queryString = new URLSearchParams(params).toString();

      // Fetch as blob with Authorization header (no token in URL)
      const res = await fetch('/api/expenses/export?' + queryString, {
        method: 'GET',
        headers: {
          Authorization: 'Bearer ' + token,
        },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Export failed');
      }

      // Convert response to blob and trigger download
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'expense_report_' + new Date().toISOString().split('T')[0] + (format === 'excel' ? '.xlsx' : '.pdf');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      success(format.toUpperCase() + ' report downloaded successfully!');
    } catch (err) {
      toastError(err.message || 'Failed to export report');
    } finally {
      setExporting('');
    }
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <Toast toasts={toasts} />

      <div>
        <h1 className="text-2xl font-display font-bold text-primary-950">Reports</h1>
        <p className="text-gray-500 text-sm mt-0.5">Export your financial data as PDF or Excel</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Filters Card */}
        <div className="card">
          <h3 className="font-display font-semibold text-primary-950 mb-4">Report Filters</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Start Date</label>
                <input
                  className="input"
                  name="startDate"
                  type="date"
                  value={filters.startDate}
                  onChange={change}
                />
              </div>
              <div>
                <label className="label">End Date</label>
                <input
                  className="input"
                  name="endDate"
                  type="date"
                  value={filters.endDate}
                  onChange={change}
                />
              </div>
            </div>
            <div>
              <label className="label">Transaction Type</label>
              <select className="input" name="type" value={filters.type} onChange={change}>
                <option value="">All transactions</option>
                <option value="expense">Expenses only</option>
                <option value="income">Income only</option>
              </select>
            </div>
            {(filters.startDate || filters.endDate || filters.type) && (
              <button
                type="button"
                onClick={() => setFilters({ startDate: '', endDate: '', type: '' })}
                className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕ Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Export Options */}
        <div className="card">
          <h3 className="font-display font-semibold text-primary-950 mb-4">Download Report</h3>
          <div className="space-y-3">
            {/* PDF */}
            <button
              type="button"
              onClick={() => handleExport('pdf')}
              disabled={!!exporting}
              className="w-full flex items-center gap-4 p-4 border-2 border-red-100 rounded-xl transition-all group disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: exporting === 'pdf' ? '#fff1f2' : 'white' }}
            >
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform">
                {exporting === 'pdf' ? (
                  <div className="w-6 h-6 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                ) : '📄'}
              </div>
              <div className="text-left flex-1">
                <p className="font-semibold text-gray-800">
                  {exporting === 'pdf' ? 'Generating PDF...' : 'Download PDF Report'}
                </p>
                <p className="text-xs text-gray-500">Formatted report with summary & transaction list</p>
              </div>
              <span className="text-xs font-bold bg-red-100 text-red-700 px-2 py-1 rounded-lg shrink-0">PDF</span>
            </button>

            {/* Excel */}
            <button
              type="button"
              onClick={() => handleExport('excel')}
              disabled={!!exporting}
              className="w-full flex items-center gap-4 p-4 border-2 border-emerald-100 rounded-xl transition-all group disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: exporting === 'excel' ? '#ecfdf5' : 'white' }}
            >
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform">
                {exporting === 'excel' ? (
                  <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                ) : '📊'}
              </div>
              <div className="text-left flex-1">
                <p className="font-semibold text-gray-800">
                  {exporting === 'excel' ? 'Generating Excel...' : 'Download Excel Report'}
                </p>
                <p className="text-xs text-gray-500">3 sheets: Summary, Transactions & By Category</p>
              </div>
              <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg shrink-0">XLSX</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="card border-primary-100" style={{ background: '#eef2ff' }}>
        <div className="flex gap-3">
          <span className="text-2xl shrink-0">💡</span>
          <div>
            <p className="font-semibold text-primary-800 text-sm mb-1">Tips</p>
            <ul className="text-xs text-primary-700 space-y-1">
              <li>• Leave dates empty to include all your transactions</li>
              <li>• PDF is best for sharing or printing</li>
              <li>• Excel is best for further analysis in spreadsheets</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;