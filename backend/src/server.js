import { createApp } from './app.js';
import { getDatabase } from './db/database.js';
import { seedDatabase } from './db/seed.js';

const PORT = process.env.PORT || 5000;

// Ensure database is initialized and has seed data on startup
try {
  const db = getDatabase();
  const boardCount = db.prepare('SELECT COUNT(*) as count FROM boards').get().count;
  if (boardCount === 0) {
    console.log('Database empty. Running initial seed...');
    seedDatabase(db);
  }
} catch (err) {
  console.error('Database initialization warning:', err.message);
}

const app = createApp();

const server = app.listen(PORT, () => {
  console.log(`TaskFlow Backend running on http://localhost:${PORT}`);
});

export default server;
