import { useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { useRequireAuth } from '../lib/useRequireAuth';
import { useTasks } from '../hooks/useTasks';
import { api } from '../lib/api';
import AnalyticsCard from '../components/analytics/AnalyticsCard';
import PriorityPieChart from '../components/analytics/PriorityPieChart';
import StatusPieChart from '../components/analytics/StatusPieChart';
import TasksOverTimeChart from '../components/analytics/TasksOverTimeChart';
import AnalyticsFilters from '../components/analytics/AnalyticsFilters';

export default function AnalyticsPage() {
  const router = useRouter();
  const isReady = useRequireAuth();
  const { tasks, isLoading: tasksLoading } = useTasks();
  const analyticsQuery = useQuery({
    queryKey: ['analytics'],
    queryFn: api.analytics,
    enabled: isReady,
  });

  const [filters, setFilters] = useState({
    dateRange: 'all', // 'all', 'today', 'week', 'month', 'custom'
    priority: 'all', // 'all', 'high', 'medium', 'low'
    status: 'all', // 'all', 'todo', 'progress', 'done'
  });

  const filteredTasks = useMemo(() => {
    if (!tasks || tasks.length === 0) return [];

    let filtered = [...tasks];

    // Filter by priority
    if (filters.priority !== 'all') {
      filtered = filtered.filter((task) => task.priority === filters.priority);
    }

    // Filter by status
    if (filters.status !== 'all') {
      filtered = filtered.filter((task) => task.status === filters.status);
    }

    // Filter by date range
    const now = new Date();
    if (filters.dateRange === 'today') {
      const todayStart = new Date(now.setHours(0, 0, 0, 0));
      filtered = filtered.filter((task) => {
        const taskDate = new Date(task.createdAt);
        return taskDate >= todayStart;
      });
    } else if (filters.dateRange === 'week') {
      const weekAgo = new Date(now.setDate(now.getDate() - 7));
      filtered = filtered.filter((task) => {
        const taskDate = new Date(task.createdAt);
        return taskDate >= weekAgo;
      });
    } else if (filters.dateRange === 'month') {
      const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
      filtered = filtered.filter((task) => {
        const taskDate = new Date(task.createdAt);
        return taskDate >= monthAgo;
      });
    }

    return filtered;
  }, [tasks, filters]);

  const analyticsData = useMemo(() => {
    const total = filteredTasks.length;
    const byPriority = {
      high: filteredTasks.filter((t) => t.priority === 'high').length,
      medium: filteredTasks.filter((t) => t.priority === 'medium').length,
      low: filteredTasks.filter((t) => t.priority === 'low').length,
    };
    const byStatus = {
      todo: filteredTasks.filter((t) => t.status === 'todo').length,
      progress: filteredTasks.filter((t) => t.status === 'progress').length,
      done: filteredTasks.filter((t) => t.status === 'done').length,
    };

    const completed = byStatus.done;
    const completionRate = total > 0 ? ((completed / total) * 100).toFixed(1) : 0;

    // Tasks created today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const createdToday = filteredTasks.filter((task) => {
      const taskDate = new Date(task.createdAt);
      return taskDate >= today;
    }).length;

    // Tasks completed today
    const completedToday = filteredTasks.filter((task) => {
      if (task.status !== 'done') return false;
      const taskDate = new Date(task.updatedAt || task.createdAt);
      return taskDate >= today;
    }).length;

    return {
      total,
      byPriority,
      byStatus,
      completionRate,
      createdToday,
      completedToday,
      highPriority: byPriority.high,
    };
  }, [filteredTasks]);

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-500">Checking session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col gap-6 bg-gradient-to-br from-slate-50 via-slate-100/50 to-blue-50/30 min-h-screen rounded-xl">
      <div className="flex flex-col gap-4">
        <button
          type="button"
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors group w-fit"
        >
          <svg
            className="w-5 h-5 group-hover:-translate-x-1 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <span className="font-medium">Back to Dashboard</span>
        </button>
        <div>
          <h1 className="text-3xl font-semibold bg-gradient-to-r from-slate-700 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Analytics Dashboard
          </h1>
          <p className="text-slate-500 mt-1">
            Track your task performance and insights
          </p>
        </div>
      </div>

      <AnalyticsFilters filters={filters} onFiltersChange={setFilters} />

      {tasksLoading || analyticsQuery.isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-500">Loading analytics...</p>
        </div>
      ) : analyticsQuery.isError ? (
        <div className="text-center py-12">
          <p className="text-red-500">Failed to load analytics: {analyticsQuery.error?.message}</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <AnalyticsCard
              title="Total Tasks"
              value={analyticsData.total}
              subtitle={`${analyticsData.createdToday} created today`}
              gradient="from-blue-400/80 to-indigo-400/80"
              icon="📊"
            />
            <AnalyticsCard
              title="Completion Rate"
              value={`${analyticsData.completionRate}%`}
              subtitle={`${analyticsData.byStatus.done} completed`}
              gradient="from-emerald-400/80 to-teal-400/80"
              icon="✅"
            />
            <AnalyticsCard
              title="High Priority"
              value={analyticsData.highPriority}
              subtitle="Urgent tasks"
              gradient="from-rose-400/80 to-pink-400/80"
              icon="🔥"
            />
            <AnalyticsCard
              title="Completed Today"
              value={analyticsData.completedToday}
              subtitle="Tasks finished"
              gradient="from-violet-400/80 to-purple-400/80"
              icon="🎯"
            />
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-red-50/60 via-rose-50/40 to-pink-50/30 rounded-xl p-6 shadow-md border border-red-100/60 backdrop-blur-sm">
              <h2 className="text-lg font-semibold text-slate-600 mb-4">Priority Distribution</h2>
              <PriorityPieChart data={analyticsData.byPriority} />
            </div>
            <div className="bg-gradient-to-br from-blue-50/60 via-indigo-50/40 to-purple-50/30 rounded-xl p-6 shadow-md border border-blue-100/60 backdrop-blur-sm">
              <h2 className="text-lg font-semibold text-slate-600 mb-4">Status Distribution</h2>
              <StatusPieChart data={analyticsData.byStatus} />
            </div>
          </div>

          {/* Charts Row 2 */}
          <div className="bg-gradient-to-br from-emerald-50/60 via-teal-50/40 to-cyan-50/30 rounded-xl p-6 shadow-md border border-emerald-100/60 backdrop-blur-sm">
            <h2 className="text-lg font-semibold text-slate-600 mb-4">Tasks Over Time</h2>
            <TasksOverTimeChart tasks={filteredTasks} />
          </div>
        </>
      )}
    </div>
  );
}

