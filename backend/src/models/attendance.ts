import db from '../config/database';

export interface AttendanceRecord {
  id?: number;
  employee_id: number;
  nfc_id: string;
  tag_type: 'check_in' | 'check_out';
  tag_time?: string;
  created_at?: string;
}

export interface AttendanceWithEmployee extends AttendanceRecord {
  employee_name: string;
  department?: string;
  position?: string;
}

export class AttendanceModel {
  static getAll(startDate?: string, endDate?: string): AttendanceWithEmployee[] {
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
    
    if (startDate && endDate) {
      query += ' WHERE DATE(ar.tag_time) BETWEEN ? AND ?';
      params.push(startDate, endDate);
    } else if (startDate) {
      query += ' WHERE DATE(ar.tag_time) >= ?';
      params.push(startDate);
    } else if (endDate) {
      query += ' WHERE DATE(ar.tag_time) <= ?';
      params.push(endDate);
    }
    
    query += ' ORDER BY ar.tag_time DESC';
    
    const stmt = db.prepare(query);
    return stmt.all(...params) as AttendanceWithEmployee[];
  }

  static getByEmployeeId(employeeId: number, startDate?: string, endDate?: string): AttendanceRecord[] {
    let query = 'SELECT * FROM attendance_records WHERE employee_id = ?';
    const params: any[] = [employeeId];
    
    if (startDate && endDate) {
      query += ' AND DATE(tag_time) BETWEEN ? AND ?';
      params.push(startDate, endDate);
    } else if (startDate) {
      query += ' AND DATE(tag_time) >= ?';
      params.push(startDate);
    } else if (endDate) {
      query += ' AND DATE(tag_time) <= ?';
      params.push(endDate);
    }
    
    query += ' ORDER BY tag_time DESC';
    
    const stmt = db.prepare(query);
    return stmt.all(...params) as AttendanceRecord[];
  }

  static getLatestByEmployeeId(employeeId: number): AttendanceRecord | undefined {
    const stmt = db.prepare(`
      SELECT * FROM attendance_records 
      WHERE employee_id = ? 
      ORDER BY tag_time DESC 
      LIMIT 1
    `);
    return stmt.get(employeeId) as AttendanceRecord | undefined;
  }

  static create(record: AttendanceRecord): number {
    const stmt = db.prepare(`
      INSERT INTO attendance_records (employee_id, nfc_id, tag_type, tag_time)
      VALUES (@employee_id, @nfc_id, @tag_type, COALESCE(@tag_time, CURRENT_TIMESTAMP))
    `);
    const result = stmt.run(record);
    return result.lastInsertRowid as number;
  }

  static delete(id: number): boolean {
    const stmt = db.prepare('DELETE FROM attendance_records WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }
}

