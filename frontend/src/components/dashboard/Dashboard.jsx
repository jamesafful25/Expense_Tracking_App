import { useState, useEffect } from 'react';
import { expensesApi } from '../../api';
import { formatCurrency } from '../../utils';
import StatCard from '../ui/StatCard';
import Loader from '../ui/Loader';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend, BarChart, Bar,
} from 'recharts';

const COLORS = ['#6366f1', '#10b981', '#f97316', '#3b82f6', '#ec4899', '#8b5cf6', '#eab308', '#06b6d4'];

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const now = new Date();
        let startDate;
        if (period === 'week') {
          const d = new Date();
          d.setDate(d.getDate() - 7);
          startDate = d.toISOString().split('T')[0];
        } else if (period === 'month') {
          startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        } else if (period === 'year') {
          startDate = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
        }

        const [sum, recent] = await Promise.all([
          expensesApi.getSummary({ startDate }),
          expensesApi.getAll({ limit: 5, page: 1 }),
        ]);
        setSummary(sum);
        setRecentExpenses(recent.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [period]);

  if (loading) return <Loader center />;

  const pieData = (summary?.byCategory || [])
    .filter((c) => c.expense > 0)
    .map((c) => ({ name: c.name, value: c.expense }));

  const monthlyData = (summary?.byMonth || []).map((m) => ({
    name: m.month,
    Expenses: m.expense,
    Income: m.income,
  }));

  const currency = 'USD';

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-primary-950">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">Your financial overview</p>
        </div>
        <div className="flex gap-1 bg-white rounded-xl border border-primary-100 p-1 shadow-sm">
          {['week', 'month', 'year'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-1.5 text-sm rounded-lg transition-all duration-200 font-medium capitalize ${
                period === p ? 'bg-primary-600 text-white shadow' : 'text-gray-500 hover:text-primary-600'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total Expenses"
          value={formatCurrency(summary?.totalExpense || 0, currency)}
          icon="💸"
          color="danger"
        />
        <StatCard
          title="Total Income"
          value={formatCurrency(summary?.totalIncome || 0, currency)}
          icon="💵"
          color="success"
        />
        <StatCard
          title="Net Balance"
          value={formatCurrency(summary?.netBalance || 0, currency)}
          icon={summary?.netBalance >= 0 ? '📈' : '📉'}
          color={summary?.netBalance >= 0 ? 'primary' : 'danger'}
        />
        <StatCard
          title="Transactions"
          value={summary?.totalCount || 0}
          icon="🧾"
          color="info"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Area Chart */}
        <div className="card xl:col-span-2">
          <h3 className="font-display font-semibold text-primary-950 mb-4">Income vs Expenses</h3>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => formatCurrency(v, currency)} />
                <Area type="monotone" dataKey="Income" stroke="#10b981" strokeWidth={2} fill="url(#colorIncome)" />
                <Area type="monotone" dataKey="Expenses" stroke="#6366f1" strokeWidth={2} fill="url(#colorExpenses)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-60 flex items-center justify-center text-gray-400 text-sm">No data for this period</div>
          )}
        </div>

        {/* Pie Chart */}
        <div className="card">
          <h3 className="font-display font-semibold text-primary-950 mb-4">By Category</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="45%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => formatCurrency(v, currency)} />
                <Legend iconType="circle" iconSize={8} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-60 flex items-center justify-center text-gray-400 text-sm">No data</div>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-primary-950">Recent Transactions</h3>
          <a href="/expenses" className="text-primary-600 text-sm font-medium hover:text-primary-800 transition-colors">
            View all →
          </a>
        </div>
        <div className="space-y-2">
          {recentExpenses.length === 0 && (
            <p className="text-gray-400 text-sm text-center py-6">No transactions yet</p>
          )}
          {recentExpenses.map((expense) => (
            <div key={expense.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors group">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-base shadow-sm"
                  style={{ backgroundColor: expense.category?.color + '20' || '#f3f4f6' }}
                >
                  {expense.category?.icon || '📌'}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{expense.title}</p>
                  <p className="text-xs text-gray-400">{expense.date} · {expense.category?.name || 'Uncategorized'}</p>
                </div>
              </div>
              <span className={`text-sm font-semibold font-mono ${expense.type === 'income' ? 'text-emerald-600' : 'text-red-500'}`}>
                {expense.type === 'income' ? '+' : '-'}{formatCurrency(expense.amount, currency)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;