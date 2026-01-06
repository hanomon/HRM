import { Request, Response } from 'express';
import { AttendanceModel } from '../models/attendance';
import { EmployeeModel } from '../models/employee';
import * as XLSX from 'xlsx';

export const getAllRecords = (req: Request, res: Response) => {
  try {
    const { start_date, end_date } = req.query;
    const records = AttendanceModel.getAll(
      start_date as string,
      end_date as string
    );
    res.json(records);
  } catch (error) {
    console.error('Error fetching attendance records:', error);
    res.status(500).json({ error: '출퇴근 기록을 가져오는데 실패했습니다.' });
  }
};

export const getRecordsByEmployeeId = (req: Request, res: Response) => {
  try {
    const employeeId = parseInt(req.params.employeeId);
    const { start_date, end_date } = req.query;
    
    const records = AttendanceModel.getByEmployeeId(
      employeeId,
      start_date as string,
      end_date as string
    );
    res.json(records);
  } catch (error) {
    console.error('Error fetching employee attendance records:', error);
    res.status(500).json({ error: '직원 출퇴근 기록을 가져오는데 실패했습니다.' });
  }
};

export const createRecord = (req: Request, res: Response) => {
  try {
    const { nfc_id } = req.body;
    
    if (!nfc_id) {
      return res.status(400).json({ error: 'NFC ID가 필요합니다.' });
    }
    
    // Find employee by NFC ID
    const employee = EmployeeModel.getByNfcId(nfc_id);
    if (!employee) {
      return res.status(404).json({ error: '등록되지 않은 NFC ID입니다.' });
    }
    
    // Get latest record to determine tag type
    const latestRecord = AttendanceModel.getLatestByEmployeeId(employee.id!);
    
    // Determine tag type based on latest record
    let tagType: 'check_in' | 'check_out' = 'check_in';
    if (latestRecord) {
      // If latest was check_in, next should be check_out
      tagType = latestRecord.tag_type === 'check_in' ? 'check_out' : 'check_in';
    }
    
    // Create new record
    const id = AttendanceModel.create({
      employee_id: employee.id!,
      nfc_id,
      tag_type: tagType
    });
    
    res.status(201).json({
      id,
      employee_id: employee.id,
      employee_name: employee.name,
      nfc_id,
      tag_type: tagType,
      message: tagType === 'check_in' ? '출근 처리되었습니다.' : '퇴근 처리되었습니다.'
    });
  } catch (error) {
    console.error('Error creating attendance record:', error);
    res.status(500).json({ error: '출퇴근 기록 생성에 실패했습니다.' });
  }
};

export const deleteRecord = (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const success = AttendanceModel.delete(id);
    
    if (!success) {
      return res.status(404).json({ error: '기록을 찾을 수 없습니다.' });
    }
    
    res.json({ message: '기록이 삭제되었습니다.' });
  } catch (error) {
    console.error('Error deleting attendance record:', error);
    res.status(500).json({ error: '기록 삭제에 실패했습니다.' });
  }
};

export const exportToExcel = (req: Request, res: Response) => {
  try {
    const { start_date, end_date } = req.query;
    const records = AttendanceModel.getAll(
      start_date as string,
      end_date as string
    );
    
    // Format data for Excel
    const excelData = records.map(record => ({
      '직원명': record.employee_name,
      '부서': record.department || '-',
      '직책': record.position || '-',
      'NFC ID': record.nfc_id,
      '구분': record.tag_type === 'check_in' ? '출근' : '퇴근',
      '태깅시간': record.tag_time
    }));
    
    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);
    
    // Set column widths
    ws['!cols'] = [
      { wch: 15 }, // 직원명
      { wch: 15 }, // 부서
      { wch: 12 }, // 직책
      { wch: 20 }, // NFC ID
      { wch: 10 }, // 구분
      { wch: 20 }  // 태깅시간
    ];
    
    XLSX.utils.book_append_sheet(wb, ws, '출퇴근기록');
    
    // Generate buffer
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    
    // Set headers
    const filename = `출퇴근기록_${new Date().toISOString().split('T')[0]}.xlsx`;
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    
    res.send(buffer);
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    res.status(500).json({ error: 'Excel 내보내기에 실패했습니다.' });
  }
};

