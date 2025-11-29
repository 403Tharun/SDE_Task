export default function AnalyticsCard({ title, value, subtitle, gradient, icon }) {
  return (
    <div className={`bg-gradient-to-br ${gradient} rounded-xl p-6 text-slate-800 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02] border border-white/20 backdrop-blur-sm`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-slate-700 uppercase tracking-wide">{title}</h3>
        <span className="text-2xl opacity-80">{icon}</span>
      </div>
      <p className="text-3xl font-bold mb-1 text-slate-800">{value}</p>
      {subtitle && <p className="text-sm text-slate-600">{subtitle}</p>}
    </div>
  );
}

