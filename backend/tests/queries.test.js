import { describe, it, expect, beforeEach } from 'vitest';
import { getDatabase } from '../src/db/database.js';
import { seedDatabase } from '../src/db/seed.js';
import { 
  getColumnTaskCounts, 
  getTasksByPriority, 
  getBoardWithColumnsAndTasks 
} from '../src/db/queries.js';

describe('Direct Database Queries (Raw SQL Layer)', () => {
  let db;

  beforeEach(() => {
    db = getDatabase();
    seedDatabase(db);
  });

  // Test Requirement 3: Direct DB layer test asserting tasks per column
  it('correctly calculates tasks per column using hand-written SQL aggregation query', () => {
    const board = db.prepare('SELECT id FROM boards LIMIT 1').get();
    expect(board).toBeDefined();

    const columnCounts = getColumnTaskCounts(board.id, db);

    // Assert that we have 3 columns in the correct position order
    expect(columnCounts).toHaveLength(3);
    expect(columnCounts[0].column_name).toBe('To Do');
    expect(columnCounts[0].position).toBe(1);
    expect(columnCounts[0].task_count).toBe(3);

    expect(columnCounts[1].column_name).toBe('In Progress');
    expect(columnCounts[1].position).toBe(2);
    expect(columnCounts[1].task_count).toBe(3);

    expect(columnCounts[2].column_name).toBe('Done');
    expect(columnCounts[2].position).toBe(3);
    expect(columnCounts[2].task_count).toBe(3);
  });

  // Test Requirement 3: Direct DB layer test asserting tasks by priority
  it('correctly retrieves tasks filtered by priority ordered newest first using hand-written SQL query', () => {
    const board = db.prepare('SELECT id FROM boards LIMIT 1').get();
    expect(board).toBeDefined();

    // Query High priority tasks from seed (3 tasks are High: 1 in To Do, 1 in In Progress, 1 in Done)
    const highTasks = getTasksByPriority(board.id, 'High', db);
    expect(highTasks).toHaveLength(3);
    
    // Check priority value and column join
    highTasks.forEach(task => {
      expect(task.priority).toBe('High');
      expect(task.column_name).toBeDefined();
      expect(['To Do', 'In Progress', 'Done']).toContain(task.column_name);
    });

    // Check ordering: created_at DESC / id DESC
    for (let i = 0; i < highTasks.length - 1; i++) {
      const current = highTasks[i];
      const next = highTasks[i + 1];
      expect(new Date(current.created_at).getTime()).toBeGreaterThanOrEqual(new Date(next.created_at).getTime());
    }

    // Query Low priority tasks
    const lowTasks = getTasksByPriority(board.id, 'Low', db);
    expect(lowTasks).toHaveLength(3);
    lowTasks.forEach(task => {
      expect(task.priority).toBe('Low');
    });
  });

  it('fetches full board hierarchy with nested columns and tasks', () => {
    const board = db.prepare('SELECT id FROM boards LIMIT 1').get();
    const fullBoard = getBoardWithColumnsAndTasks(board.id, db);

    expect(fullBoard).toBeDefined();
    expect(fullBoard.name).toBe('TaskFlow Main Board');
    expect(fullBoard.columns).toHaveLength(3);
    expect(fullBoard.columns[0].tasks).toHaveLength(3);
    expect(fullBoard.columns[1].tasks).toHaveLength(3);
    expect(fullBoard.columns[2].tasks).toHaveLength(3);
  });
});
