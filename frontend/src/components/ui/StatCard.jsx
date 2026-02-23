const StatCard = ({ title, value, subtitle, icon, color = 'primary', trend }) => {
  const colors = {
    primary: { bg: 'bg-primary-50', text: 'text-primary-600', icon: 'bg-primary-100' },
    success: { bg: 'bg-emerald-50', text: 'text-emerald-600', icon: 'bg-emerald-100' },
    danger: { bg: 'bg-red-50', text: 'text-red-600', icon: 'bg-red-100' },
    warning: { bg: 'bg-amber-50', text: 'text-amber-600', icon: 'bg-amber-100' },
    info: { bg: 'bg-cyan-50', text: 'text-cyan-600', icon: 'bg-cyan-100' },
  };

  const c = colors[color] || colors.primary;

  return (
    <div className="card hover:shadow-card-hover transition-shadow duration-300 group">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <p className={`text-2xl font-bold font-display ${c.text}`}>{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${trend.positive ? 'text-emerald-600' : 'text-red-500'}`}>
              <span>{trend.positive ? '↑' : '↓'}</span>
              <span>{trend.label}</span>
            </div>
          )}
        </div>
        <div className={`${c.icon} p-3 rounded-xl group-hover:scale-110 transition-transform duration-200`}>
          <span className={`text-xl ${c.text}`}>{icon}</span>
        </div>
      </div>
    </div>
  );
};

export default StatCard;