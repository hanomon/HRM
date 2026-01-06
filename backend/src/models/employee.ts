import db from '../config/database';

export interface Employee {
  id?: number;
  nfc_id: string;
  name: string;
  department?: string;
  position?: string;
  email?: string;
  phone?: string;
  created_at?: string;
  updated_at?: string;
}

export class EmployeeModel {
  static getAll(): Employee[] {
    const stmt = db.prepare('SELECT * FROM employees ORDER BY name');
    return stmt.all() as Employee[];
  }

  static getById(id: number): Employee | undefined {
    const stmt = db.prepare('SELECT * FROM employees WHERE id = ?');
    return stmt.get(id) as Employee | undefined;
  }

  static getByNfcId(nfc_id: string): Employee | undefined {
    const stmt = db.prepare('SELECT * FROM employees WHERE nfc_id = ?');
    return stmt.get(nfc_id) as Employee | undefined;
  }

  static create(employee: Employee): number {
    const stmt = db.prepare(`
      INSERT INTO employees (nfc_id, name, department, position, email, phone)
      VALUES (@nfc_id, @name, @department, @position, @email, @phone)
    `);
    const result = stmt.run(employee);
    return result.lastInsertRowid as number;
  }

  static update(id: number, employee: Partial<Employee>): boolean {
    const fields: string[] = [];
    const values: any = { id };

    if (employee.nfc_id !== undefined) {
      fields.push('nfc_id = @nfc_id');
      values.nfc_id = employee.nfc_id;
    }
    if (employee.name !== undefined) {
      fields.push('name = @name');
      values.name = employee.name;
    }
    if (employee.department !== undefined) {
      fields.push('department = @department');
      values.department = employee.department;
    }
    if (employee.position !== undefined) {
      fields.push('position = @position');
      values.position = employee.position;
    }
    if (employee.email !== undefined) {
      fields.push('email = @email');
      values.email = employee.email;
    }
    if (employee.phone !== undefined) {
      fields.push('phone = @phone');
      values.phone = employee.phone;
    }

    if (fields.length === 0) return false;

    fields.push('updated_at = CURRENT_TIMESTAMP');

    const stmt = db.prepare(`
      UPDATE employees SET ${fields.join(', ')} WHERE id = @id
    `);
    const result = stmt.run(values);
    return result.changes > 0;
  }

  static delete(id: number): boolean {
    const stmt = db.prepare('DELETE FROM employees WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }
}

