import { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { api } from '../lib/api';

const PRIORITY_OPTIONS = ['high', 'medium', 'low'];
const STATUS_OPTIONS = ['todo', 'progress', 'done'];

export default function TaskForm({ initialData, onSubmit, isSubmitting }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'todo',
  });
  const [classificationSource, setClassificationSource] = useState(null);

  useEffect(() => {
    if (initialData) {
      setForm({
        title: initialData.title || '',
        description: initialData.description || '',
        priority: initialData.priority || 'medium',
        status: initialData.status || 'todo',
      });
    }
  }, [initialData]);

  const classifyMutation = useMutation({
    mutationFn: (desc) => api.classify(desc),
    onSuccess: (data) => {
      setForm((prev) => ({ ...prev, priority: data.priority, status: data.status }));
      setClassificationSource(data.source);
    },
    onError: () => {
      setClassificationSource('unavailable');
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  const handleClassify = () => {
    if (!form.description) return;
    classifyMutation.mutate(form.description);
  };

  return (
    <form onSubmit={handleSubmit} className="card flex flex-col gap-4">
      <div>
        <label className="text-sm font-medium text-slate-700">Title</label>
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          className="mt-1 w-full rounded-md border border-slate-200 p-2"
          required
        />
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700">Description</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={4}
          className="mt-1 w-full rounded-md border border-slate-200 p-2"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-slate-700">Priority</label>
          <select
            name="priority"
            value={form.priority}
            onChange={handleChange}
            className="mt-1 w-full rounded-md border border-slate-200 p-2"
          >
            {PRIORITY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">Status</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="mt-1 w-full rounded-md border border-slate-200 p-2"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={handleClassify}
          disabled={!form.description || classifyMutation.isPending}
          className="w-full rounded-md bg-indigo-100 text-indigo-700 py-2 font-medium disabled:opacity-50"
        >
          {classifyMutation.isPending ? 'Classifying...' : 'Auto-categorize using AI'}
        </button>
        {classificationSource && (
          <p className="text-xs text-slate-500">
            Classification source: {classificationSource}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-md bg-blue-600 text-white py-2 font-semibold disabled:opacity-50"
      >
        {isSubmitting ? 'Saving...' : 'Save Task'}
      </button>
    </form>
  );
}


