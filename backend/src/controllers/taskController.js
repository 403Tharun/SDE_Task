const Task = require('../models/Task');
const { validateTask, validateClassifier } = require('../utils/validators');
const { classify } = require('../services/classifierClient');
const memoryStore = require('../services/memoryTaskStore');

const useMemoryStore = !process.env.MONGODB_URI;

// Log which store is being used
if (useMemoryStore) {
  console.log('');
} else {
  console.log('✅ Using MongoDB database:', process.env.MONGODB_URI.split('@')[1]?.split('/')[1] || 'taskmanager');
}

async function createTask(req, res) {
  const { error, value } = validateTask(req.body);
  if (error) {
    return res.status(400).json({ message: error.details.map((d) => d.message).join(', ') });
  }

  try {
    const task = useMemoryStore ? memoryStore.create(value) : await Task.create(value);
    console.log('✅ Task created:', useMemoryStore ? 'in-memory' : 'MongoDB', task._id || task.id);
    return res.status(201).json(task);
  } catch (error) {
    console.error('❌ Error creating task:', error.message);
    return res.status(500).json({ message: 'Failed to create task', error: error.message });
  }
}

async function getTasks(_, res) {
  try {
    if (useMemoryStore) {
      const tasks = memoryStore.list();
      console.log('📋 Retrieved', tasks.length, 'tasks from in-memory store');
      return res.json(tasks);
    }
    const tasks = await Task.find().sort({ createdAt: -1 });
    console.log('📋 Retrieved', tasks.length, 'tasks from MongoDB');
    return res.json(tasks);
  } catch (error) {
    console.error('❌ Error fetching tasks:', error.message);
    return res.status(500).json({ message: 'Failed to fetch tasks', error: error.message });
  }
}

async function getTaskById(req, res) {
  const { id } = req.params;
  const task = useMemoryStore ? memoryStore.getById(id) : await Task.findById(id);
  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }
  return res.json(task);
}

async function updateTask(req, res) {
  const { id } = req.params;
  const { error, value } = validateTask(req.body);
  if (error) {
    return res.status(400).json({ message: error.details.map((d) => d.message).join(', ') });
  }

  const task = useMemoryStore
    ? memoryStore.update(id, value)
    : await Task.findByIdAndUpdate(id, value, { new: true });
  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }
  return res.json(task);
}

async function deleteTask(req, res) {
  const { id } = req.params;
  const task = useMemoryStore ? memoryStore.remove(id) : await Task.findByIdAndDelete(id);
  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }
  return res.status(204).send();
}

async function classifyTask(req, res) {
  const { error, value } = validateClassifier(req.body);
  if (error) {
    return res.status(400).json({ message: error.details.map((d) => d.message).join(', ') });
  }

  const result = await classify(value.description, process.env.CLASSIFIER_URL);
  return res.json(result);
}

async function getAnalytics(_, res) {
  if (useMemoryStore) {
    return res.json(memoryStore.analytics());
  }

  const aggregate = await Task.aggregate([
    {
      $group: {
        _id: null,
        high: { $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] } },
        medium: { $sum: { $cond: [{ $eq: ['$priority', 'medium'] }, 1, 0] } },
        low: { $sum: { $cond: [{ $eq: ['$priority', 'low'] }, 1, 0] } },
        todo: { $sum: { $cond: [{ $eq: ['$status', 'todo'] }, 1, 0] } },
        progress: { $sum: { $cond: [{ $eq: ['$status', 'progress'] }, 1, 0] } },
        done: { $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] } },
      },
    },
  ]);

  const stats = aggregate[0] || {
    high: 0,
    medium: 0,
    low: 0,
    todo: 0,
    progress: 0,
    done: 0,
  };

  return res.json({
    byPriority: {
      high: stats.high,
      medium: stats.medium,
      low: stats.low,
    },
    byStatus: {
      todo: stats.todo,
      progress: stats.progress,
      done: stats.done,
    },
  });
}

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  classifyTask,
  getAnalytics,
};


