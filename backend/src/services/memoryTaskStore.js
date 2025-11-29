// Simple in-memory task store for development when MongoDB is not configured.
// This is NOT for production use.

let tasks = [];

function generateId() {
  return Math.random().toString(36).slice(2);
}

function list() {
  return tasks;
}

function getById(id) {
  return tasks.find((t) => t._id === id) || null;
}

function create(payload) {
  const now = new Date().toISOString();
  const task = {
    _id: generateId(),
    title: payload.title,
    description: payload.description || '',
    priority: payload.priority || 'medium',
    status: payload.status || 'todo',
    createdAt: now,
    updatedAt: now,
  };
  tasks.push(task);
  return task;
}

function update(id, payload) {
  const index = tasks.findIndex((t) => t._id === id);
  if (index === -1) return null;
  const now = new Date().toISOString();
  tasks[index] = {
    ...tasks[index],
    ...payload,
    updatedAt: now,
  };
  return tasks[index];
}

function remove(id) {
  const index = tasks.findIndex((t) => t._id === id);
  if (index === -1) return null;
  const [deleted] = tasks.splice(index, 1);
  return deleted;
}

function analytics() {
  const byPriority = { high: 0, medium: 0, low: 0 };
  const byStatus = { todo: 0, progress: 0, done: 0 };

  tasks.forEach((t) => {
    if (byPriority[t.priority] !== undefined) byPriority[t.priority] += 1;
    if (byStatus[t.status] !== undefined) byStatus[t.status] += 1;
  });

  return { byPriority, byStatus };
}

module.exports = {
  list,
  getById,
  create,
  update,
  remove,
  analytics,
};


