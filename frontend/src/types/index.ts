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

export interface AttendanceRecord {
  id?: number;
  employee_id: number;
  nfc_id: string;
  tag_type: 'check_in' | 'check_out';
  tag_time?: string;
  created_at?: string;
  employee_name?: string;
  department?: string;
  position?: string;
}

export interface NFCTagResponse {
  id: number;
  employee_id: number;
  employee_name: string;
  nfc_id: string;
  tag_type: 'check_in' | 'check_out';
  message: string;
}

