/**
 * Dashboard Page with Dynamic Greeting
 * 
 * Displays a personalized, time-based greeting in the header:
 * - Extracts username from logged-in user's email (part before @)
 * - Shows time-appropriate greeting (Good morning/afternoon/evening/Hello)
 * - Falls back to "Hi, User" if no email is available
 * - Includes optional avatar circle with user's first initial
 */
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useRequireAuth } from '../lib/useRequireAuth';
import { useTasks } from '../hooks/useTasks';
import TaskBoard from '../components/TaskBoard';
import AddTaskModal from '../components/AddTaskModal';
// import ChartAnalytics from '../components/ChartAnalytics';
import { useState, useEffect } from 'react';
import { getAuth } from '../lib/auth';

export default function DashboardPage() {
  const isReady = useRequireAuth();
  const { groups, isLoading, isError, error, createTask, updateTask, deleteTask } = useTasks();
  const analyticsQuery = useQuery({
    queryKey: ['analytics'],
    queryFn: api.analytics,
    enabled: isReady,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [defaultStatus, setDefaultStatus] = useState('todo');
  const [greeting, setGreeting] = useState('Hi, User');
  const [userInitial, setUserInitial] = useState('U');

  // Get time-based greeting and username from email
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const auth = getAuth();
    let extractedUsername = 'User';
    let initial = 'U';

    if (auth?.email) {
      // Extract username from email (part before @)
      const emailParts = auth.email.split('@');
      if (emailParts[0]) {
        const rawName = emailParts[0];
        // Capitalize: first letter uppercase, rest lowercase
        extractedUsername = rawName.charAt(0).toUpperCase() + rawName.slice(1).toLowerCase();
        initial = extractedUsername.charAt(0).toUpperCase();
      }
    }

    setUserInitial(initial);

    // Get time-based greeting
    const hour = new Date().getHours();
    let timeGreeting = 'Hello';
    
    if (hour >= 5 && hour < 12) {
      timeGreeting = 'Good morning';
    } else if (hour >= 12 && hour < 17) {
      timeGreeting = 'Good afternoon';
    } else if (hour >= 17 && hour < 21) {
      timeGreeting = 'Good evening';
    } else {
      // 21:00 - 04:59: Use "Hello" for night/early morning
      timeGreeting = 'Hello';
    }

    // Use time-based greeting with username, or "Hi, User" as fallback
    if (extractedUsername === 'User') {
      setGreeting('Hi, User');
    } else {
      setGreeting(`${timeGreeting}, ${extractedUsername}`);
    }
  }, []);

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

  const handleAdd = (statusKey) => {
    setEditingTask(null);
    setDefaultStatus(statusKey || 'todo');
    setIsModalOpen(true);
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    deleteTask(id);
  };

  const handleSubmitModal = async (payload) => {
    const finalPayload = {
      ...payload,
      status: editingTask ? payload.status : defaultStatus,
    };

    if (editingTask) {
      await updateTask(editingTask._id, finalPayload);
    } else {
      await createTask(finalPayload);
    }
    setIsModalOpen(false);
    setEditingTask(null);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col gap-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen rounded-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar circle with user's first initial */}
          <div 
            className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-lg shadow-md"
            aria-hidden="true"
          >
            {userInitial}
          </div>
          <div>
            <h1 
              className="text-3xl font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
              aria-label="dashboard greeting"
            >
              {greeting}
            </h1>
            <p className="text-slate-600">
              Your tasks, lined up and ready to go.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => handleAdd('todo')}
          className="rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold px-4 py-2 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
        >
          + New Task
        </button>
      </div>

      {isLoading && <p>Loading tasks...</p>}
      {isError && (
        <p className="text-red-500">Failed to load tasks: {error?.message || 'Unknown error'}</p>
      )}

      {!isLoading && !isError && (
        <TaskBoard
          groups={groups}
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      <AddTaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTask(null);
        }}
        initialTask={editingTask}
        onSubmit={handleSubmitModal}
      />
    </div>
  );
}

