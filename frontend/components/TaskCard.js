import clsx from 'clsx';

const priorityColors = {
  high: 'border-red-500 bg-gradient-to-br from-red-50 to-white',
  medium: 'border-yellow-500 bg-gradient-to-br from-yellow-50 to-white',
  low: 'border-green-500 bg-gradient-to-br from-green-50 to-white',
};

const STATUS_COLORS = {
  todo: 'bg-slate-100 text-slate-700',
  progress: 'bg-blue-100 text-blue-700',
  done: 'bg-emerald-100 text-emerald-700',
};

export default function TaskCard({ task, onDelete, onEdit }) {
  const priorityClass = priorityColors[task.priority] || priorityColors.medium;

  return (
    <div
      className={clsx(
        'border-2 rounded-xl p-4 shadow-sm flex flex-col gap-3 cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02]',
        priorityClass
      )}
    >
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">{task.title}</h3>
        <span className="text-xs px-2 py-1 rounded-full uppercase tracking-wide bg-white/70">
          {task.priority}
        </span>
      </div>
      <p className="text-sm text-slate-600">
        {task.description?.slice(0, 140) || 'No description'}
        {task.description?.length > 140 && '...'}
      </p>
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span
          className={clsx(
            'inline-flex items-center gap-1 rounded-full px-2 py-0.5 capitalize',
            STATUS_COLORS[task.status]
          )}
        >
          {task.status}
        </span>
        {task.dueDate && (
          <span className="text-slate-500">
            Due {new Date(task.dueDate).toLocaleDateString()}
          </span>
        )}
      </div>
      {Array.isArray(task.members) && task.members.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {task.members.map((m) => (
            <span
              key={m}
              className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600"
            >
              {m}
            </span>
          ))}
        </div>
      )}
      <div className="flex gap-3 text-xs pt-1">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onEdit?.(task);
          }}
          className="border border-blue-600 text-blue-600 px-3 py-1 rounded-md text-xs font-medium hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 hover:shadow-sm"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.(task._id);
          }}
          className="border border-red-500 text-red-500 px-3 py-1 rounded-md text-xs font-medium hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 transition-all duration-200 hover:shadow-sm"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

