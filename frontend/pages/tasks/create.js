import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import TaskForm from '../../components/TaskForm';
import { api, queryClient } from '../../lib/api';
import { useRequireAuth } from '../../lib/useRequireAuth';

export default function CreateTaskPage() {
  const router = useRouter();
  const isReady = useRequireAuth();

  const createMutation = useMutation({
    mutationFn: api.createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      router.push('/dashboard');
    },
  });

  const handleSubmit = (values) => {
    createMutation.mutate(values);
  };

  if (!isReady) {
    return <p className="p-8 text-center text-slate-500">Checking session...</p>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-4">Create Task</h1>
      <TaskForm onSubmit={handleSubmit} isSubmitting={createMutation.isPending} />
    </div>
  );
}

