const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Task = require('../src/models/Task');
const app = require('../src/app');

let mongo;
const originalClassifierUrl = process.env.CLASSIFIER_URL;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri();
  await mongoose.connect(uri);
});

afterEach(async () => {
  await Task.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongo.stop();
  process.env.CLASSIFIER_URL = originalClassifierUrl;
});

const authHeader = { 'X-User-Email': 'test@example.com' };

describe('Tasks API', () => {
  test('creates a task', async () => {
    const res = await request(app).post('/tasks').set(authHeader).send({
      title: 'Write docs',
      description: 'Document API',
      priority: 'high',
      status: 'todo',
    });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Write docs');
  });

  test('lists tasks', async () => {
    await Task.create({ title: 'seed task' });
    const res = await request(app).get('/tasks').set(authHeader);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });

  test('updates a task', async () => {
    const task = await Task.create({ title: 'to update' });
    const res = await request(app)
      .put(`/tasks/${task.id}`)
      .set(authHeader)
      .send({ title: 'updated', description: '', priority: 'medium', status: 'todo' });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe('updated');
  });

  test('deletes a task', async () => {
    const task = await Task.create({ title: 'to delete' });
    const res = await request(app).delete(`/tasks/${task.id}`).set(authHeader);
    expect(res.status).toBe(204);
  });

  test('classifies via fallback when classifier missing', async () => {
    process.env.CLASSIFIER_URL = '';
    const res = await request(app)
      .post('/tasks/classify')
      .set(authHeader)
      .send({ description: 'This is urgent and critical' });
    expect(res.status).toBe(200);
    expect(res.body.priority).toBe('high');
  });

  test('analytics endpoint aggregates counts', async () => {
    await Task.create([
      { title: 'A', priority: 'high', status: 'todo' },
      { title: 'B', priority: 'low', status: 'done' },
    ]);
    const res = await request(app).get('/tasks/analytics').set(authHeader);
    expect(res.status).toBe(200);
    expect(res.body.byPriority.high).toBe(1);
    expect(res.body.byStatus.done).toBe(1);
  });
});

