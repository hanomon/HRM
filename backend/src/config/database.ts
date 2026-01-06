import Database from 'better-sqlite3';
import path from 'path';

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../../attendance.db');
const db = new Database(dbPath);

// Enable WAL mode for better concurrent access
db.pragma('journal_mode = WAL');

// 직원 테이블
db.exec(`
  CREATE TABLE IF NOT EXISTS employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nfc_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    department TEXT,
    position TEXT,
    email TEXT,
    phone TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// 출퇴근 기록 테이블
db.exec(`
  CREATE TABLE IF NOT EXISTS attendance_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL,
    nfc_id TEXT NOT NULL,
    tag_type TEXT NOT NULL CHECK(tag_type IN ('check_in', 'check_out')),
    tag_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
  )
`);

// 인덱스 생성
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_nfc_id ON employees(nfc_id);
  CREATE INDEX IF NOT EXISTS idx_employee_id ON attendance_records(employee_id);
  CREATE INDEX IF NOT EXISTS idx_tag_time ON attendance_records(tag_time);
`);

export default db;

