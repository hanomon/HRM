import pool from '../config/database';

export interface Employee {
  id: number;
  nfc_id: string;
  name: string;
  department?: string;
  position?: string;
  email?: string;
  phone?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface EmployeeCreate {
  nfc_id: string;
  name: string;
  department?: string;
  position?: string;
  email?: string;
  phone?: string;
}

export class EmployeeModel {
  // 전체 직원 조회
  static async getAll(): Promise<Employee[]> {
    const result = await pool.query(
      'SELECT * FROM employees ORDER BY id DESC'
    );
    return result.rows;
  }

  // ID로 직원 조회
  static async getById(id: number): Promise<Employee | null> {
    const result = await pool.query(
      'SELECT * FROM employees WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  // NFC ID로 직원 조회
  static async getByNfcId(nfc_id: string): Promise<Employee | null> {
    const result = await pool.query(
      'SELECT * FROM employees WHERE nfc_id = $1',
      [nfc_id]
    );
    return result.rows[0] || null;
  }

  // 직원 생성
  static async create(employee: EmployeeCreate): Promise<number> {
    const result = await pool.query(
      `INSERT INTO employees (nfc_id, name, department, position, email, phone)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [
        employee.nfc_id,
        employee.name,
        employee.department || null,
        employee.position || null,
        employee.email || null,
        employee.phone || null
      ]
    );
    return result.rows[0].id;
  }

  // 직원 수정
  static async update(id: number, employee: Partial<EmployeeCreate>): Promise<boolean> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (employee.nfc_id !== undefined) {
      fields.push(`nfc_id = $${paramCount++}`);
      values.push(employee.nfc_id);
    }
    if (employee.name !== undefined) {
      fields.push(`name = $${paramCount++}`);
      values.push(employee.name);
    }
    if (employee.department !== undefined) {
      fields.push(`department = $${paramCount++}`);
      values.push(employee.department);
    }
    if (employee.position !== undefined) {
      fields.push(`position = $${paramCount++}`);
      values.push(employee.position);
    }
    if (employee.email !== undefined) {
      fields.push(`email = $${paramCount++}`);
      values.push(employee.email);
    }
    if (employee.phone !== undefined) {
      fields.push(`phone = $${paramCount++}`);
      values.push(employee.phone);
    }

    if (fields.length === 0) {
      return false;
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await pool.query(
      `UPDATE employees SET ${fields.join(', ')} WHERE id = $${paramCount}`,
      values
    );

    return result.rowCount !== null && result.rowCount > 0;
  }

  // 직원 삭제
  static async delete(id: number): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM employees WHERE id = $1',
      [id]
    );
    return result.rowCount !== null && result.rowCount > 0;
  }
}
