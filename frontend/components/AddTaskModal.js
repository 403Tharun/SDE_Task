import { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { tasksApi } from '../lib/tasksApi';

const PRIORITIES = ['high', 'medium', 'low'];
const STATUSES = ['todo', 'progress', 'done'];

export default function AddTaskModal({ isOpen, onClose, initialTask, onSubmit }) {
  const [values, setValues] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'todo',
    dueDate: '',
    members: '',
  });
  const [aiSource, setAiSource] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    if (initialTask) {
      setValues({
        title: initialTask.title || '',
        description: initialTask.description || '',
        priority: initialTask.priority || 'medium',
        status: initialTask.status || 'todo',
        dueDate: initialTask.dueDate ? initialTask.dueDate.slice(0, 10) : '',
        members: Array.isArray(initialTask.members) ? initialTask.members.join(', ') : '',
      });
    } else {
      setValues((prev) => ({
        ...prev,
        title: '',
        description: '',
        priority: 'medium',
        status: 'todo',
        dueDate: '',
        members: '',
      }));
    }
    setAiSource(null);
  }, [isOpen, initialTask]);

  const classifyMutation = useMutation({
    mutationFn: (description) => tasksApi.classify(description),
    onSuccess: (data) => {
      setValues((prev) => ({
        ...prev,
        priority: data.priority || prev.priority,
        status: data.status || prev.status,
      }));
      setAiSource(data.source || 'classifier');
    },
    onError: () => {
      setAiSource('unavailable');
    },
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleClassify = () => {
    if (!values.description) return;
    classifyMutation.mutate(values.description);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      title: values.title,
      description: values.description,
      priority: values.priority,
      status: values.status,
    };
    onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="card w-full max-w-lg max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white to-slate-50 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            {initialTask ? 'Edit Task' : 'Add Task'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-sm"
          >
            Close
          </button>
        </div>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm font-medium text-slate-700">Title</label>
            <input
              name="title"
              value={values.title}
              onChange={handleChange}
              required
              className="mt-1 w-full rounded-md border border-slate-200 p-2 text-sm"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Description</label>
            <textarea
              name="description"
              value={values.description}
              onChange={handleChange}
              rows={3}
              className="mt-1 w-full rounded-md border border-slate-200 p-2 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Priority</label>
              <select
                name="priority"
                value={values.priority}
                onChange={handleChange}
                className="mt-1 w-full rounded-md border border-slate-200 p-2 text-sm"
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Status</label>
              <select
                name="status"
                value={values.status}
                onChange={handleChange}
                className="mt-1 w-full rounded-md border border-slate-200 p-2 text-sm"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Due date</label>
              <input
                type="date"
                name="dueDate"
                value={values.dueDate}
                onChange={handleChange}
                className="mt-1 w-full rounded-md border border-slate-200 p-2 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">
                Members (comma separated)
              </label>
              <input
                name="members"
                value={values.members}
                onChange={handleChange}
                placeholder="alice, bob"
                className="mt-1 w-full rounded-md border border-slate-200 p-2 text-sm"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={handleClassify}
            disabled={!values.description || classifyMutation.isPending}
            className="w-full rounded-md bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-2 text-sm font-medium disabled:opacity-50 hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            {classifyMutation.isPending
              ? 'Classifying...'
              : 'Auto-Categorize using AI'}
          </button>
            {aiSource && (
              <p className="text-xs text-slate-500">
                Classification source: {aiSource}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 text-sm font-semibold disabled:opacity-50 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            {initialTask ? 'Save changes' : 'Create task'}
          </button>
        </form>
      </div>
    </div>
  );
}


