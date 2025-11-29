export default function ChartAnalytics({ data }) {
  if (!data) return null;

  const priorities = Object.entries(data.byPriority || {});
  const statuses = Object.entries(data.byStatus || {});

  const renderBars = (items) =>
    items.map(([label, value]) => (
      <div key={label} className="flex items-center gap-3">
        <span className="w-20 text-sm capitalize text-slate-600">{label}</span>
        <div className="flex-1 bg-slate-100 rounded-full h-3">
          <div
            className="bg-blue-500 h-3 rounded-full"
            style={{ width: `${Math.min(value * 20, 100)}%` }}
          />
        </div>
        <span className="text-sm text-slate-700">{value}</span>
      </div>
    ));

  return (
    <div className="card flex flex-col gap-4">
      <h3 className="font-semibold text-lg">Analytics</h3>
      <div>
        <p className="text-sm font-medium text-slate-500 mb-2">By Priority</p>
        <div className="flex flex-col gap-2">{renderBars(priorities)}</div>
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500 mb-2">By Status</p>
        <div className="flex flex-col gap-2">{renderBars(statuses)}</div>
      </div>
    </div>
  );
}


