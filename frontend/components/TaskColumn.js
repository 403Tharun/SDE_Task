import TaskCard from './TaskCard';

export default function TaskColumn({ title, tasks, statusKey, onAddClick, onEdit, onDelete }) {
  const columnGradients = {
    todo: 'bg-gradient-to-br from-white to-slate-50 border-slate-300',
    progress: 'bg-gradient-to-br from-white to-blue-50 border-blue-300',
    done: 'bg-gradient-to-br from-white to-emerald-50 border-emerald-300',
  };

  const gradientClass = columnGradients[statusKey] || columnGradients.todo;

  return (
    <section className={`flex flex-col gap-4 border-2 rounded-xl p-4 shadow-md min-h-[200px] ${gradientClass}`}>
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
            {title}
          </h2>
          <p className="text-xs text-slate-400">{tasks.length} task{tasks.length !== 1 && 's'}</p>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onAddClick?.(statusKey);
          }}
          className="rounded-full border border-dashed border-slate-300 px-2 py-1 text-xs text-slate-500 hover:border-slate-400 hover:text-slate-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200"
        >
          + Add
        </button>
      </header>
      <div className="flex flex-col gap-3">
        {tasks.map((task) => (
          <TaskCard
            key={task._id}
            task={task}
            onDelete={onDelete}
            onEdit={onEdit}
          />
        ))}
        {tasks.length === 0 && (
          <p className="text-xs text-slate-400 italic">No tasks in this column.</p>
        )}
      </div>
    </section>
  );
}


