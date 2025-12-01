import Database from 'better-sqlite3';
import path from 'path';

// Use a safe path for the database file to avoid encoding issues
const DB_PATH = path.join(process.cwd(), 'pos.db');

const db = new Database(DB_PATH);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');

export default db;
