import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getInitials } from '../../utils';

const navItems = [
  { to: '/dashboard', icon: '📊', label: 'Dashboard' },
  { to: '/expenses', icon: '💸', label: 'Expenses' },
  { to: '/budgets', icon: '🎯', label: 'Budgets' },
  { to: '/categories', icon: '🏷️', label: 'Categories' },
  { to: '/reports', icon: '📈', label: 'Reports' },
  { to: '/profile', icon: '👤', label: 'Profile' },
];

const AppLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex bg-[#f8f9ff]">
      {/* Sidebar */}
      <aside className="w-64 bg-primary-950 flex flex-col fixed top-0 left-0 h-full z-30 shadow-2xl">
        {/* Logo */}
        <div className="px-6 py-6 border-b border-primary-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-lg">💰</span>
            </div>
            <div>
              <h1 className="font-display font-bold text-white text-base leading-none">Expense</h1>
              <span className="text-primary-400 text-xs font-medium">Tracker</span>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/50'
                    : 'text-primary-300 hover:bg-primary-800 hover:text-white'
                }`
              }
            >
              <span className="text-base w-5 text-center">{icon}</span>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="px-3 py-4 border-t border-primary-800">
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-primary-800 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-bold shadow-md shrink-0">
              {user?.avatar
                ? <img src={user.avatar} alt="avatar" className="w-full h-full rounded-xl object-cover" />
                : getInitials(user?.name || 'U')
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{user?.name}</p>
              <p className="text-primary-400 text-xs truncate">{user?.email}</p>
            </div>
            <button onClick={handleLogout} className="text-primary-400 hover:text-red-400 transition-colors shrink-0" title="Logout">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-64 min-h-screen">
        <div className="p-6 md:p-8 animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AppLayout;