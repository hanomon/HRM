import axios from 'axios';
import { Employee, AttendanceRecord } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Employee APIs
export const employeeApi = {
  getAll: () => api.get<Employee[]>('/employees'),
  getById: (id: number) => api.get<Employee>(`/employees/${id}`),
  getByNfcId: (nfcId: string) => api.get<Employee>(`/employees/nfc/${nfcId}`),
  create: (employee: Employee) => api.post<Employee>('/employees', employee),
  update: (id: number, employee: Partial<Employee>) => 
    api.put<Employee>(`/employees/${id}`, employee),
  delete: (id: number) => api.delete(`/employees/${id}`),
};

// Attendance APIs
export const attendanceApi = {
  getAll: (startDate?: string, endDate?: string) => 
    api.get<AttendanceRecord[]>('/attendance', { 
      params: { start_date: startDate, end_date: endDate } 
    }),
  getByEmployeeId: (employeeId: number, startDate?: string, endDate?: string) => 
    api.get<AttendanceRecord[]>(`/attendance/employee/${employeeId}`, {
      params: { start_date: startDate, end_date: endDate }
    }),
  create: (nfcId: string) => api.post('/attendance', { nfc_id: nfcId }),
  delete: (id: number) => api.delete(`/attendance/${id}`),
  exportToExcel: (startDate?: string, endDate?: string) => 
    api.get('/attendance/export/excel', {
      params: { start_date: startDate, end_date: endDate },
      responseType: 'blob'
    }),
};

export default api;

