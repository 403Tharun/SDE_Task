import { useRouter } from 'next/router';
import { useQuery, useMutation } from '@tanstack/react-query';
import TaskForm from '../../../components/TaskForm';
import { api, queryClient } from '../../../lib/api';
import { useRequireAuth } from '../../../lib/useRequireAuth';

export default function EditTaskPage() {
  const router = useRouter();
  const { id } = router.query;
  const isReady = useRequireAuth();

  const taskQuery = useQuery({
    queryKey: ['task', id],
    queryFn: () => api.getTask(id),
    enabled: Boolean(id) && isReady,
  });

  const updateMutation = useMutation({
    mutationFn: (payload) => api.updateTask(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      router.push('/dashboard');
    },
  });

  const handleSubmit = (values) => {
    updateMutation.mutate(values);
  };

  if (!isReady) {
    return <p className="p-8 text-center text-slate-500">Checking session...</p>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-4">Edit Task</h1>
      {taskQuery.isLoading && <p>Loading task...</p>}
      {taskQuery.isError && (
        <p className="text-red-500">Failed to load task: {taskQuery.error.message}</p>
      )}
      {taskQuery.data && (
        <TaskForm
          initialData={taskQuery.data}
          onSubmit={handleSubmit}
          isSubmitting={updateMutation.isPending}
        />
      )}
    </div>
  );
}

