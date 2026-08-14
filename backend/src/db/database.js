import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SCHEMA_PATH = path.join(__dirname, 'schema.sql');
const DEFAULT_DB_PATH = path.join(__dirname, '../../taskflow.db');

export function createDatabaseConnection(dbPath = DEFAULT_DB_PATH) {
  const db = new Database(dbPath);
  
  // Enable foreign key support explicitly
  db.pragma('foreign_keys = ON');

  // Execute schema.sql to ensure tables exist
  const schemaSql = fs.readFileSync(SCHEMA_PATH, 'utf-8');
  db.exec(schemaSql);

  return db;
}

// Default singleton instance for application runtime
let dbInstance = null;

export function getDatabase() {
  if (!dbInstance) {
    dbInstance = createDatabaseConnection();
  }
  return dbInstance;
}

export default getDatabase;
