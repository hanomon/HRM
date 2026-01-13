import { Request, Response } from 'express';
import { EmployeeModel } from '../models/employee';
import { AttendanceModel } from '../models/attendance';
import { normalizeNfcId, isValidNfcId } from '../utils/nfcUtils';

/**
 * NFC ID로 직원의 출근 정보를 종합적으로 반환
 * - 직원 기본 정보
 * - 오늘의 출근 기록
 * - 이번 달 출근 통계
 * - 최근 5개 출근 기록
 */
export const getInfoByNfcId = async (req: Request, res: Response) => {
  try {
    const { nfc_id } = req.params;
    
    // NFC ID 정규화
    const normalizedNfcId = normalizeNfcId(nfc_id);
    
    if (!isValidNfcId(normalizedNfcId)) {
      return res.status(400).json({ error: '유효하지 않은 NFC ID 형식입니다.' });
    }

    // 1. 직원 정보 조회
    const employee = await EmployeeModel.getByNfcId(normalizedNfcId);
    if (!employee) {
      return res.status(404).json({ 
        error: 'NFC ID에 해당하는 직원을 찾을 수 없습니다.',
        nfc_id: normalizedNfcId 
      });
    }

    // 2. 오늘의 출근 기록
    const todayRecords = await AttendanceModel.getTodayRecordsByEmployeeId(employee.id!);

    // 3. 이번 달 통계
    const monthlyStats = await AttendanceModel.getMonthlyStatsByEmployeeId(employee.id!);

    // 4. 최근 출근 기록 (최근 5개)
    const recentRecords = await AttendanceModel.getRecentRecordsByEmployeeId(employee.id!, 5);

    // 5. 마지막 태그 정보
    const latestRecord = await AttendanceModel.getLatestByEmployeeId(employee.id!);

    // 응답 데이터 구성
    res.json({
      success: true,
      employee: {
        id: employee.id,
        nfc_id: employee.nfc_id,
        name: employee.name,
        department: employee.department,
        position: employee.position,
        email: employee.email,
        phone: employee.phone
      },
      today: {
        date: new Date().toISOString().split('T')[0],
        records: todayRecords,
        check_in: todayRecords.find(r => r.tag_type === 'check_in') || null,
        check_out: todayRecords.find(r => r.tag_type === 'check_out') || null,
        is_checked_in: todayRecords.some(r => r.tag_type === 'check_in'),
        is_checked_out: todayRecords.some(r => r.tag_type === 'check_out')
      },
      monthly_stats: monthlyStats,
      recent_records: recentRecords,
      last_tag: latestRecord ? {
        type: latestRecord.tag_type,
        time: latestRecord.tag_time
      } : null
    });
  } catch (error) {
    console.error('Error fetching employee info by NFC ID:', error);
    res.status(500).json({ 
      error: '직원 정보를 가져오는데 실패했습니다.',
      details: error instanceof Error ? error.message : '알 수 없는 오류' 
    });
  }
};

/**
 * POST 방식으로 NFC ID로 직원의 출근 정보 조회
 * Body: { nfc_id: string }
 */
export const getInfoByNfcIdPost = async (req: Request, res: Response) => {
  try {
    const { nfc_id } = req.body;

    if (!nfc_id) {
      return res.status(400).json({ 
        error: 'NFC ID는 필수입니다.',
        required_field: 'nfc_id' 
      });
    }

    // GET 핸들러 재사용 (req.params에 nfc_id 주입)
    req.params.nfc_id = nfc_id;
    return getInfoByNfcId(req, res);
  } catch (error) {
    console.error('Error in POST info:', error);
    res.status(500).json({ 
      error: '직원 정보를 가져오는데 실패했습니다.',
      details: error instanceof Error ? error.message : '알 수 없는 오류' 
    });
  }
};

