export default function AnalyticsFilters({ filters, onFiltersChange }) {
  const handleFilterChange = (key, value) => {
    onFiltersChange((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <div className="bg-gradient-to-br from-white/90 via-slate-50/50 to-blue-50/30 rounded-xl p-4 shadow-md border border-slate-200/60 backdrop-blur-sm">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-slate-700">Date Range:</label>
          <select
            value={filters.dateRange}
            onChange={(e) => handleFilterChange('dateRange', e.target.value)}
            className="rounded-md border border-slate-200 px-3 py-1.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-slate-700">Priority:</label>
          <select
            value={filters.priority}
            onChange={(e) => handleFilterChange('priority', e.target.value)}
            className="rounded-md border border-slate-200 px-3 py-1.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white"
          >
            <option value="all">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-slate-700">Status:</label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="rounded-md border border-slate-200 px-3 py-1.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white"
          >
            <option value="all">All Statuses</option>
            <option value="todo">Todo</option>
            <option value="progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>

        <button
          type="button"
          onClick={() =>
            onFiltersChange({
              dateRange: 'all',
              priority: 'all',
              status: 'all',
            })
          }
          className="ml-auto px-4 py-1.5 text-sm font-medium text-slate-600 border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
}

