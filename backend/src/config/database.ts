import { Pool } from 'pg';

// PostgreSQL 연결 풀 생성
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// 연결 테스트
pool.on('connect', () => {
  console.log('✅ PostgreSQL 데이터베이스 연결 성공');
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL 연결 오류:', err);
});

// 데이터베이스 초기화 함수
export async function initializeDatabase() {
  const client = await pool.connect();
  
  try {
    // 직원 테이블 생성
    await client.query(`
      CREATE TABLE IF NOT EXISTS employees (
        id SERIAL PRIMARY KEY,
        nfc_id VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        department VARCHAR(255),
        position VARCHAR(255),
        email VARCHAR(255),
        phone VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 출퇴근 기록 테이블 생성
    await client.query(`
      CREATE TABLE IF NOT EXISTS attendance_records (
        id SERIAL PRIMARY KEY,
        employee_id INTEGER NOT NULL,
        nfc_id VARCHAR(255) NOT NULL,
        tag_type VARCHAR(50) NOT NULL CHECK(tag_type IN ('check_in', 'check_out')),
        tag_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
      )
    `);

    // 인덱스 생성
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_nfc_id ON employees(nfc_id)
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_employee_id ON attendance_records(employee_id)
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_tag_time ON attendance_records(tag_time)
    `);

    console.log('✅ 데이터베이스 테이블 초기화 완료');
  } catch (error) {
    console.error('❌ 데이터베이스 초기화 실패:', error);
    throw error;
  } finally {
    client.release();
  }
}

export default pool;
