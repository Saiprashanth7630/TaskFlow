import { getDatabase } from './database.js';

export function seedDatabase(db = getDatabase()) {
  const insertBoard = db.prepare('INSERT INTO boards (name) VALUES (?)');
  const insertColumn = db.prepare('INSERT INTO columns (board_id, name, position) VALUES (?, ?, ?)');
  const insertTask = db.prepare('INSERT INTO tasks (column_id, title, description, priority) VALUES (?, ?, ?, ?)');

  const transaction = db.transaction(() => {
    // Clear existing data (in reverse dependency order)
    db.prepare('DELETE FROM tasks').run();
    db.prepare('DELETE FROM columns').run();
    db.prepare('DELETE FROM boards').run();
    db.prepare("DELETE FROM sqlite_sequence WHERE name IN ('boards', 'columns', 'tasks')").run();

    // 1. Create main board
    const boardResult = insertBoard.run('TaskFlow Main Board');
    const boardId = boardResult.lastInsertRowid;

    // 2. Create 3 columns (To Do, In Progress, Done)
    const todoCol = insertColumn.run(boardId, 'To Do', 1).lastInsertRowid;
    const inProgressCol = insertColumn.run(boardId, 'In Progress', 2).lastInsertRowid;
    const doneCol = insertColumn.run(boardId, 'Done', 3).lastInsertRowid;

    // 3. Create ~9 sample tasks with varied priorities
    const sampleTasks = [
      // To Do
      {
        columnId: todoCol,
        title: 'Design user onboarding flow',
        description: 'Create wireframes and user journey for the first-time setup experience.',
        priority: 'High'
      },
      {
        columnId: todoCol,
        title: 'Write API documentation',
        description: 'Document endpoints, error codes, and request bodies for external consumers.',
        priority: 'Medium'
      },
      {
        columnId: todoCol,
        title: 'Update third-party dependencies',
        description: 'Review security advisories and bump outdated npm packages.',
        priority: 'Low'
      },
      // In Progress
      {
        columnId: inProgressCol,
        title: 'Refactor database query layer',
        description: 'Optimize column task counts and indexing strategies for high throughput.',
        priority: 'High'
      },
      {
        columnId: inProgressCol,
        title: 'Implement priority filter UI',
        description: 'Allow users to filter board view by Low, Medium, and High priority.',
        priority: 'Medium'
      },
      {
        columnId: inProgressCol,
        title: 'Fix modal keyboard accessibility',
        description: 'Ensure ESC key closes task creation and edit modals properly.',
        priority: 'Low'
      },
      // Done
      {
        columnId: doneCol,
        title: 'Setup Express backend server',
        description: 'Configure Express, CORS, and JSON body parsing middleware.',
        priority: 'High'
      },
      {
        columnId: doneCol,
        title: 'Draft database schema',
        description: 'Define SQL schema with foreign key constraints and validation rules.',
        priority: 'Medium'
      },
      {
        columnId: doneCol,
        title: 'Initialize Git repository',
        description: 'Create repository structure, .gitignore, and initial commits.',
        priority: 'Low'
      }
    ];

    for (const task of sampleTasks) {
      insertTask.run(task.columnId, task.title, task.description, task.priority);
    }

    return { boardId, columnCount: 3, taskCount: sampleTasks.length };
  });

  const result = transaction();
  return result;
}

// Auto-seed if called directly
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  try {
    const db = getDatabase();
    const result = seedDatabase(db);
    console.log(`Database seeded successfully! Board ID: ${result.boardId}, Columns: ${result.columnCount}, Tasks: ${result.taskCount}`);
  } catch (error) {
    console.error('Failed to seed database:', error);
    process.exit(1);
  }
}
