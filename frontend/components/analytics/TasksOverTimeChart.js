import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function TasksOverTimeChart({ tasks }) {
  const chartData = useMemo(() => {
    if (!tasks || tasks.length === 0) return [];

    // Group tasks by date
    const grouped = {};
    tasks.forEach((task) => {
      const date = new Date(task.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
      if (!grouped[date]) {
        grouped[date] = { date, created: 0, completed: 0 };
      }
      grouped[date].created += 1;
      if (task.status === 'done') {
        const completedDate = new Date(task.updatedAt || task.createdAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        });
        if (!grouped[completedDate]) {
          grouped[completedDate] = { date: completedDate, created: 0, completed: 0 };
        }
        if (completedDate === date) {
          grouped[date].completed += 1;
        } else {
          grouped[completedDate].completed += 1;
        }
      }
    });

    // Convert to array and sort by date
    const sorted = Object.values(grouped).sort((a, b) => {
      const dateA = new Date(a.date + ', ' + new Date().getFullYear());
      const dateB = new Date(b.date + ', ' + new Date().getFullYear());
      return dateA - dateB;
    });
    return sorted.slice(-14); // Last 14 days
  }, [tasks]);

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        <p>No data available</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis
          dataKey="date"
          stroke="#64748b"
          style={{ fontSize: '12px' }}
        />
        <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
          }}
        />
        <Legend />
        <Bar
          dataKey="created"
          fill="#60a5fa"
          name="Created"
          radius={[8, 8, 0, 0]}
        />
        <Bar
          dataKey="completed"
          fill="#34d399"
          name="Completed"
          radius={[8, 8, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

