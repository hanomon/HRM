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
}
