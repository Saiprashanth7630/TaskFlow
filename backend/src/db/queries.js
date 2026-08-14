import { getDatabase } from './database.js';

/**
 * Hand-written SQL Query #1:
 * Computes the total number of tasks in each column for a given board using a LEFT JOIN and GROUP BY.
 * Returns columns even if they have 0 tasks (count = 0).
 */
export function getColumnTaskCounts(boardId, db = getDatabase()) {
  const query = `
    SELECT 
      c.id AS column_id,
      c.name AS column_name,
      c.position,
      COUNT(t.id) AS task_count
    FROM columns c
    LEFT JOIN tasks t ON c.id = t.column_id
    WHERE c.board_id = ?
    GROUP BY c.id, c.name, c.position
    ORDER BY c.position ASC
  `;
  return db.prepare(query).all(boardId);
}

/**
 * Hand-written SQL Query #2:
 * Fetches all tasks matching a specific priority on a given board,
 * joining the columns table to include column names, ordered newest first (created_at DESC, id DESC).
 */
export function getTasksByPriority(boardId, priority, db = getDatabase()) {
  const query = `
    SELECT 
      t.id,
      t.column_id,
      t.title,
      t.description,
      t.priority,
      t.created_at,
      c.name AS column_name,
      c.position AS column_position
    FROM tasks t
    JOIN columns c ON t.column_id = c.id
    WHERE c.board_id = ? AND t.priority = ?
    ORDER BY t.created_at DESC, t.id DESC
  `;
  return db.prepare(query).all(boardId, priority);
}

/**
 * Fetch a complete board with its columns and all nested tasks.
 */
export function getBoardWithColumnsAndTasks(boardId, db = getDatabase()) {
  const board = db.prepare('SELECT * FROM boards WHERE id = ?').get(boardId);
  if (!board) return null;

  const columns = db.prepare('SELECT * FROM columns WHERE board_id = ? ORDER BY position ASC').all(boardId);
  
  const tasksQuery = db.prepare('SELECT * FROM tasks WHERE column_id = ? ORDER BY created_at ASC, id ASC');
  
  const columnsWithTasks = columns.map(column => {
    const tasks = tasksQuery.all(column.id);
    return {
      ...column,
      tasks
    };
  });

  return {
    ...board,
    columns: columnsWithTasks
  };
}

/**
 * Fetch the first available board (useful for single-board default).
 */
export function getFirstBoard(db = getDatabase()) {
  const board = db.prepare('SELECT * FROM boards ORDER BY id ASC LIMIT 1').get();
  if (!board) return null;
  return getBoardWithColumnsAndTasks(board.id, db);
}

/**
 * Create a new task.
 */
export function createTask({ column_id, title, description = '', priority = 'Medium' }, db = getDatabase()) {
  // Validate column existence
  const column = db.prepare('SELECT id FROM columns WHERE id = ?').get(column_id);
  if (!column) {
    throw new Error(`Column with ID ${column_id} does not exist`);
  }

  const stmt = db.prepare(`
    INSERT INTO tasks (column_id, title, description, priority)
    VALUES (?, ?, ?, ?)
  `);

  const result = stmt.run(column_id, title.trim(), (description || '').trim(), priority);
  return db.prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid);
}

/**
 * Update an existing task's title, description, and/or priority.
 */
export function updateTask(id, { title, description, priority, column_id }, db = getDatabase()) {
  const existing = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  if (!existing) {
    return null;
  }

  const updatedTitle = title !== undefined ? title.trim() : existing.title;
  const updatedDesc = description !== undefined ? description.trim() : existing.description;
  const updatedPriority = priority !== undefined ? priority : existing.priority;
  const updatedColId = column_id !== undefined ? column_id : existing.column_id;

  if (column_id !== undefined) {
    const column = db.prepare('SELECT id FROM columns WHERE id = ?').get(column_id);
    if (!column) {
      throw new Error(`Column with ID ${column_id} does not exist`);
    }
  }

  const stmt = db.prepare(`
    UPDATE tasks 
    SET title = ?, description = ?, priority = ?, column_id = ?
    WHERE id = ?
  `);

  stmt.run(updatedTitle, updatedDesc, updatedPriority, updatedColId, id);
  return db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
}

/**
 * Move task to a different column.
 */
export function moveTask(id, column_id, db = getDatabase()) {
  const existing = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  if (!existing) {
    return null;
  }

  const column = db.prepare('SELECT id FROM columns WHERE id = ?').get(column_id);
  if (!column) {
    throw new Error(`Column with ID ${column_id} does not exist`);
  }

  db.prepare('UPDATE tasks SET column_id = ? WHERE id = ?').run(column_id, id);
  return db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
}

/**
 * Delete a task by ID.
 */
export function deleteTask(id, db = getDatabase()) {
  const existing = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  if (!existing) {
    return false;
  }

  db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
  return true;
}
