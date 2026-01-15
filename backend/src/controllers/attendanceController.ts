import { Request, Response } from 'express';
import { AttendanceModel } from '../models/attendance';
import { EmployeeModel } from '../models/employee';
import * as XLSX from 'xlsx';
import { normalizeNfcId, isValidNfcId } from '../utils/nfcUtils';

export const getAllRecords = async (req: Request, res: Response) => {
  try {
    const { start_date, end_date } = req.query;
    const records = await AttendanceModel.getAll(
      start_date as string,
      end_date as string
    );
    res.json(records);
  } catch (error) {
    console.error('Error fetching attendance records:', error);
    res.status(500).json({ error: '출퇴근 기록을 가져오는데 실패했습니다.' });
  }
};

export const getRecordsByEmployeeId = async (req: Request, res: Response) => {
  try {
    const employeeId = parseInt(req.params.employeeId);
    const { start_date, end_date } = req.query;
    
    const records = await AttendanceModel.getByEmployeeId(
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

export const createRecord = async (req: Request, res: Response) => {
  try {
    const { nfc_id, action } = req.body;

    if (!nfc_id) {
      return res.status(400).json({ error: 'NFC ID가 필요합니다.' });
    }

    // action 파라미터 검증 (있는 경우)
    if (action && !['check_in', 'check_out'].includes(action)) {
      return res.status(400).json({
        error: '유효하지 않은 action입니다. check_in 또는 check_out만 허용됩니다.'
      });
    }

    // NFC ID 정규화
    const normalizedNfcId = normalizeNfcId(nfc_id);

    if (!isValidNfcId(normalizedNfcId)) {
      return res.status(400).json({ error: '유효하지 않은 NFC ID 형식입니다.' });
    }

    // Find employee by NFC ID
    const employee = await EmployeeModel.getByNfcId(normalizedNfcId);
    if (!employee) {
      return res.status(404).json({ error: '등록되지 않은 NFC ID입니다.' });
    }

    // Determine tag type
    let tagType: 'check_in' | 'check_out';

    if (action) {
      // action이 명시된 경우 해당 값 사용
      tagType = action as 'check_in' | 'check_out';
    } else {
      // action이 없으면 기존 자동 판단 로직 사용 (하위 호환)
      const latestRecord = await AttendanceModel.getLatestByEmployeeId(employee.id!);
      tagType = 'check_in';
      if (latestRecord) {
        tagType = latestRecord.tag_type === 'check_in' ? 'check_out' : 'check_in';
      }
    }

    // Create new record
    const id = await AttendanceModel.create({
      employee_id: employee.id!,
      nfc_id: normalizedNfcId,
      tag_type: tagType
    });

    res.status(201).json({
      id,
      employee_id: employee.id,
      employee_name: employee.name,
      nfc_id: normalizedNfcId,
      tag_type: tagType,
      message: tagType === 'check_in' ? '출근 처리되었습니다.' : '퇴근 처리되었습니다.'
    });
  } catch (error) {
    console.error('Error creating attendance record:', error);
    res.status(500).json({ error: '출퇴근 기록 생성에 실패했습니다.' });
  }
};

export const deleteRecord = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const success = await AttendanceModel.delete(id);
    
    if (!success) {
      return res.status(404).json({ error: '기록을 찾을 수 없습니다.' });
    }
    
    res.json({ message: '기록이 삭제되었습니다.' });
  } catch (error) {
    console.error('Error deleting attendance record:', error);
    res.status(500).json({ error: '기록 삭제에 실패했습니다.' });
  }
};

export const exportToExcel = async (req: Request, res: Response) => {
  try {
    const { start_date, end_date } = req.query;
    const records = await AttendanceModel.getAll(
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
