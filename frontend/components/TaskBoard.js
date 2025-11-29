import TaskColumn from './TaskColumn';

const COLUMN_CONFIG = [
  { key: 'todo', title: 'Todo' },
  { key: 'progress', title: 'In Progress' },
  { key: 'done', title: 'Done' },
];

export default function TaskBoard({ groups, onAdd, onEdit, onDelete }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {COLUMN_CONFIG.map((col) => (
        <TaskColumn
          key={col.key}
          title={col.title}
          statusKey={col.key}
          tasks={groups[col.key] || []}
          onAddClick={onAdd}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}


