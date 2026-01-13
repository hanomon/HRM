import pool from '../config/database';

export interface AttendanceRecord {
  id?: number;
  employee_id: number;
  nfc_id: string;
  tag_type: 'check_in' | 'check_out';
  tag_time?: Date;
  created_at?: Date;
}

export interface AttendanceWithEmployee extends AttendanceRecord {
  employee_name: string;
  department?: string;
  position?: string;
}

export class AttendanceModel {
  static async getAll(startDate?: string, endDate?: string): Promise<AttendanceWithEmployee[]> {
    let query = `
      SELECT 
        ar.*,
        e.name as employee_name,
        e.department,
        e.position
      FROM attendance_records ar
      LEFT JOIN employees e ON ar.employee_id = e.id
    `;
    
    const params: any[] = [];
    let paramCount = 1;
    
    if (startDate && endDate) {
      query += ` WHERE DATE(ar.tag_time) BETWEEN $${paramCount++} AND $${paramCount++}`;
      params.push(startDate, endDate);
    } else if (startDate) {
      query += ` WHERE DATE(ar.tag_time) >= $${paramCount++}`;
      params.push(startDate);
    } else if (endDate) {
      query += ` WHERE DATE(ar.tag_time) <= $${paramCount++}`;
      params.push(endDate);
    }
    
    query += ' ORDER BY ar.tag_time DESC';
    
    const result = await pool.query(query, params);
    return result.rows;
  }

  static async getByEmployeeId(employeeId: number, startDate?: string, endDate?: string): Promise<AttendanceRecord[]> {
    let query = 'SELECT * FROM attendance_records WHERE employee_id = $1';
    const params: any[] = [employeeId];
    let paramCount = 2;
    
    if (startDate && endDate) {
      query += ` AND DATE(tag_time) BETWEEN $${paramCount++} AND $${paramCount++}`;
      params.push(startDate, endDate);
    } else if (startDate) {
      query += ` AND DATE(tag_time) >= $${paramCount++}`;
      params.push(startDate);
    } else if (endDate) {
      query += ` AND DATE(tag_time) <= $${paramCount++}`;
      params.push(endDate);
    }
    
    query += ' ORDER BY tag_time DESC';
    
    const result = await pool.query(query, params);
    return result.rows;
  }

  static async getLatestByEmployeeId(employeeId: number): Promise<AttendanceRecord | null> {
    const result = await pool.query(
      `SELECT * FROM attendance_records 
       WHERE employee_id = $1 
       ORDER BY tag_time DESC 
       LIMIT 1`,
      [employeeId]
    );
    return result.rows[0] || null;
  }

  static async create(record: AttendanceRecord): Promise<number> {
    const result = await pool.query(
      `INSERT INTO attendance_records (employee_id, nfc_id, tag_type, tag_time)
       VALUES ($1, $2, $3, COALESCE($4, CURRENT_TIMESTAMP))
       RETURNING id`,
      [record.employee_id, record.nfc_id, record.tag_type, record.tag_time || null]
    );
    return result.rows[0].id;
  }

  static async delete(id: number): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM attendance_records WHERE id = $1',
      [id]
    );
    return result.rowCount !== null && result.rowCount > 0;
  }

  // 오늘의 출근 기록 조회
  static async getTodayRecordsByEmployeeId(employeeId: number): Promise<AttendanceRecord[]> {
    const result = await pool.query(
      `SELECT * FROM attendance_records 
       WHERE employee_id = $1 
       AND DATE(tag_time) = CURRENT_DATE
       ORDER BY tag_time ASC`,
      [employeeId]
    );
    return result.rows;
  }

  // 이번 달 출근 통계
  static async getMonthlyStatsByEmployeeId(employeeId: number): Promise<{
    total_days: number;
    check_in_count: number;
    check_out_count: number;
    on_time_count: number;
    late_count: number;
  }> {
    const result = await pool.query(
      `SELECT 
        COUNT(DISTINCT DATE(tag_time)) as total_days,
        SUM(CASE WHEN tag_type = 'check_in' THEN 1 ELSE 0 END) as check_in_count,
        SUM(CASE WHEN tag_type = 'check_out' THEN 1 ELSE 0 END) as check_out_count,
        SUM(CASE WHEN tag_type = 'check_in' 
            AND EXTRACT(HOUR FROM tag_time) < 9 THEN 1 ELSE 0 END) as on_time_count,
        SUM(CASE WHEN tag_type = 'check_in' 
            AND EXTRACT(HOUR FROM tag_time) >= 9 THEN 1 ELSE 0 END) as late_count
       FROM attendance_records
       WHERE employee_id = $1
       AND EXTRACT(YEAR FROM tag_time) = EXTRACT(YEAR FROM CURRENT_DATE)
       AND EXTRACT(MONTH FROM tag_time) = EXTRACT(MONTH FROM CURRENT_DATE)`,
      [employeeId]
    );
    return {
      total_days: parseInt(result.rows[0].total_days || '0'),
      check_in_count: parseInt(result.rows[0].check_in_count || '0'),
      check_out_count: parseInt(result.rows[0].check_out_count || '0'),
      on_time_count: parseInt(result.rows[0].on_time_count || '0'),
      late_count: parseInt(result.rows[0].late_count || '0')
    };
  }

  // 최근 N개 출근 기록
  static async getRecentRecordsByEmployeeId(employeeId: number, limit: number = 5): Promise<AttendanceRecord[]> {
    const result = await pool.query(
      `SELECT * FROM attendance_records 
       WHERE employee_id = $1 
       ORDER BY tag_time DESC 
       LIMIT $2`,
      [employeeId, limit]
    );
    return result.rows;
  }
}
