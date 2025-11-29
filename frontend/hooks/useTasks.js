import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksApi } from '../lib/tasksApi';

const STATUSES = ['todo', 'progress', 'done'];

const weightForPriority = (priority) => {
  if (!priority) return 4;
  const key = String(priority).toLowerCase();
  if (key === 'high') return 1;
  if (key === 'medium') return 2;
  if (key === 'low') return 3;
  return 4;
};

function groupAndSortTasks(tasks) {
  const groups = {
    todo: [],
    progress: [],
    done: [],
  };

  (tasks || []).forEach((task) => {
    const statusKey = STATUSES.includes(task.status) ? task.status : 'todo';
    groups[statusKey].push(task);
  });

  STATUSES.forEach((status) => {
    groups[status].sort(
      (a, b) => weightForPriority(a.priority) - weightForPriority(b.priority)
    );
  });

  return groups;
}

export function useTasks() {
  const queryClient = useQueryClient();

  const tasksQuery = useQuery({
    queryKey: ['tasks'],
    queryFn: tasksApi.getTasks,
  });

  const createMutation = useMutation({
    mutationFn: tasksApi.createTask,
    onSuccess: (created) => {
      queryClient.setQueryData(['tasks'], (old = []) => {
        const next = [...old, created];
        return next;
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }) => tasksApi.updateTask(id, values),
    onSuccess: (updated) => {
      queryClient.setQueryData(['tasks'], (old = []) =>
        old.map((task) => (task._id === updated._id ? updated : task))
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: tasksApi.deleteTask,
    onSuccess: (_, id) => {
      queryClient.setQueryData(['tasks'], (old = []) =>
        old.filter((task) => task._id !== id)
      );
    },
  });

  const groups = useMemo(
    () => groupAndSortTasks(tasksQuery.data || []),
    [tasksQuery.data]
  );

  return {
    tasks: tasksQuery.data || [],
    groups,
    isLoading: tasksQuery.isLoading,
    isError: tasksQuery.isError,
    error: tasksQuery.error,
    refetch: tasksQuery.refetch,
    createTask: (values) => createMutation.mutateAsync(values),
    updateTask: (id, values) => updateMutation.mutateAsync({ id, values }),
    deleteTask: (id) => deleteMutation.mutate(id),
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}


