import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { getDatabase } from '../src/db/database.js';
import { seedDatabase } from '../src/db/seed.js';

describe('Task API Endpoints', () => {
  let app;
  let db;

  beforeEach(() => {
    db = getDatabase();
    seedDatabase(db);
    app = createApp();
  });

  // Test Requirement 1: Creating a task with an empty title returns an error and does not create a row
  it('rejects task creation with an empty title (400) and does not insert a row', async () => {
    const countBefore = db.prepare('SELECT COUNT(*) as count FROM tasks').get().count;

    const response = await request(app)
      .post('/api/tasks')
      .send({
        column_id: 1,
        title: '',
        description: 'Test description',
        priority: 'Medium'
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBeDefined();
    expect(response.body.error).toMatch(/title/i);

    const countAfter = db.prepare('SELECT COUNT(*) as count FROM tasks').get().count;
    expect(countAfter).toBe(countBefore);
  });

  it('rejects task creation with whitespace-only title (400) and does not insert a row', async () => {
    const countBefore = db.prepare('SELECT COUNT(*) as count FROM tasks').get().count;

    const response = await request(app)
      .post('/api/tasks')
      .send({
        column_id: 1,
        title: '   \t  \n  ',
        description: 'Test description',
        priority: 'High'
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBeDefined();

    const countAfter = db.prepare('SELECT COUNT(*) as count FROM tasks').get().count;
    expect(countAfter).toBe(countBefore);
  });

  // Test Requirement 2: Moving a task to a new column updates its column_id/status correctly
  it('moves a task to a new column and updates its column_id correctly', async () => {
    // Grab a task from column 1 (To Do)
    const task = db.prepare('SELECT * FROM tasks WHERE column_id = 1 LIMIT 1').get();
    expect(task).toBeDefined();

    // Target column 2 (In Progress)
    const targetColumnId = 2;

    const response = await request(app)
      .patch(`/api/tasks/${task.id}/move`)
      .send({ column_id: targetColumnId });

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(task.id);
    expect(response.body.column_id).toBe(targetColumnId);

    // Verify persisted directly in database
    const updatedInDb = db.prepare('SELECT * FROM tasks WHERE id = ?').get(task.id);
    expect(updatedInDb.column_id).toBe(targetColumnId);
  });

  it('successfully creates a valid task with 201 status', async () => {
    const response = await request(app)
      .post('/api/tasks')
      .send({
        column_id: 1,
        title: 'New Valid Task',
        description: 'Detailed description',
        priority: 'High'
      });

    expect(response.status).toBe(201);
    expect(response.body.title).toBe('New Valid Task');
    expect(response.body.priority).toBe('High');
    expect(response.body.id).toBeDefined();

    const inDb = db.prepare('SELECT * FROM tasks WHERE id = ?').get(response.body.id);
    expect(inDb).toBeDefined();
    expect(inDb.title).toBe('New Valid Task');
  });

  it('updates task details via PUT /api/tasks/:id', async () => {
    const task = db.prepare('SELECT * FROM tasks LIMIT 1').get();

    const response = await request(app)
      .put(`/api/tasks/${task.id}`)
      .send({
        title: 'Updated Task Title',
        description: 'Updated Description',
        priority: 'Low'
      });

    expect(response.status).toBe(200);
    expect(response.body.title).toBe('Updated Task Title');
    expect(response.body.priority).toBe('Low');

    const inDb = db.prepare('SELECT * FROM tasks WHERE id = ?').get(task.id);
    expect(inDb.title).toBe('Updated Task Title');
    expect(inDb.priority).toBe('Low');
  });

  it('deletes a task via DELETE /api/tasks/:id', async () => {
    const task = db.prepare('SELECT * FROM tasks LIMIT 1').get();

    const response = await request(app).delete(`/api/tasks/${task.id}`);
    expect(response.status).toBe(200);

    const inDb = db.prepare('SELECT * FROM tasks WHERE id = ?').get(task.id);
    expect(inDb).toBeUndefined();
  });
});
