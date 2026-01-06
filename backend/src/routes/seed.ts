import { Router, Request, Response } from 'express';
import pool from '../config/database';

const router = Router();

// 날짜 생성 헬퍼 함수 (지난 N일 전)
function getDaysAgo(days: number, hours: number = 9, minutes: number = 0): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

// Seed API 엔드포인트
router.post('/', async (req: Request, res: Response) => {
  const client = await pool.connect();
  
  try {
    console.log('🌱 Seed API 호출됨');

    await client.query('BEGIN');

    // 기존 데이터 확인
    const countResult = await client.query('SELECT COUNT(*) as count FROM employees');
    const existingCount = parseInt(countResult.rows[0].count);
    
    if (existingCount > 0) {
      // 기존 데이터 삭제
      await client.query('DELETE FROM attendance_records');
      await client.query('DELETE FROM employees');
      console.log('✅ 기존 데이터 삭제됨');
    }

    // 샘플 직원 데이터
    const sampleEmployees = [
      {
        nfc_id: '04:A1:B2:C3:D4:E5:F6',
        name: '김철수',
        department: '개발팀',
        position: '팀장',
        email: 'kim@company.com',
        phone: '010-1234-5678'
      },
      {
        nfc_id: '04:B2:C3:D4:E5:F6:A1',
        name: '이영희',
        department: '기획팀',
        position: '대리',
        email: 'lee@company.com',
        phone: '010-2345-6789'
      },
      {
        nfc_id: '04:C3:D4:E5:F6:A1:B2',
        name: '박민수',
        department: '개발팀',
        position: '사원',
        email: 'park@company.com',
        phone: '010-3456-7890'
      }
    ];

    // 직원 추가
    const employeeIds: { [key: string]: number } = {};
    
    for (const employee of sampleEmployees) {
      const result = await client.query(
        `INSERT INTO employees (nfc_id, name, department, position, email, phone)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
        [employee.nfc_id, employee.name, employee.department, employee.position, employee.email, employee.phone]
      );
      employeeIds[employee.nfc_id] = result.rows[0].id;
    }

    // 출퇴근 기록 생성
    interface AttendanceRecord {
      employee_id: number;
      nfc_id: string;
      tag_type: 'check_in' | 'check_out';
      tag_time: Date;
    }
    
    const records: AttendanceRecord[] = [];

    // 지난 7일간의 데이터 생성
    for (let day = 6; day >= 0; day--) {
      // 김철수
      records.push({
        employee_id: employeeIds['04:A1:B2:C3:D4:E5:F6'],
        nfc_id: '04:A1:B2:C3:D4:E5:F6',
        tag_type: 'check_in',
        tag_time: getDaysAgo(day, 8, 45 + Math.floor(Math.random() * 20))
      });
      records.push({
        employee_id: employeeIds['04:A1:B2:C3:D4:E5:F6'],
        nfc_id: '04:A1:B2:C3:D4:E5:F6',
        tag_type: 'check_out',
        tag_time: getDaysAgo(day, 18, 30 + Math.floor(Math.random() * 30))
      });

      // 이영희
      records.push({
        employee_id: employeeIds['04:B2:C3:D4:E5:F6:A1'],
        nfc_id: '04:B2:C3:D4:E5:F6:A1',
        tag_type: 'check_in',
        tag_time: getDaysAgo(day, 8, 50 + Math.floor(Math.random() * 15))
      });
      records.push({
        employee_id: employeeIds['04:B2:C3:D4:E5:F6:A1'],
        nfc_id: '04:B2:C3:D4:E5:F6:A1',
        tag_type: 'check_out',
        tag_time: getDaysAgo(day, 18, 0 + Math.floor(Math.random() * 20))
      });

      // 박민수
      const checkInHour = day === 2 ? 9 : 8;
      const checkInMinute = day === 2 ? 15 : 55;
      records.push({
        employee_id: employeeIds['04:C3:D4:E5:F6:A1:B2'],
        nfc_id: '04:C3:D4:E5:F6:A1:B2',
        tag_type: 'check_in',
        tag_time: getDaysAgo(day, checkInHour, checkInMinute + Math.floor(Math.random() * 10))
      });
      records.push({
        employee_id: employeeIds['04:C3:D4:E5:F6:A1:B2'],
        nfc_id: '04:C3:D4:E5:F6:A1:B2',
        tag_type: 'check_out',
        tag_time: getDaysAgo(day, 18, 10 + Math.floor(Math.random() * 25))
      });
    }

    // 오늘은 출근만 기록
    records.push({
      employee_id: employeeIds['04:A1:B2:C3:D4:E5:F6'],
      nfc_id: '04:A1:B2:C3:D4:E5:F6',
      tag_type: 'check_in',
      tag_time: getDaysAgo(0, 8, 47)
    });
    records.push({
      employee_id: employeeIds['04:B2:C3:D4:E5:F6:A1'],
      nfc_id: '04:B2:C3:D4:E5:F6:A1',
      tag_type: 'check_in',
      tag_time: getDaysAgo(0, 8, 52)
    });
    records.push({
      employee_id: employeeIds['04:C3:D4:E5:F6:A1:B2'],
      nfc_id: '04:C3:D4:E5:F6:A1:B2',
      tag_type: 'check_in',
      tag_time: getDaysAgo(0, 8, 58)
    });

    // 출퇴근 기록 추가
    let checkInCount = 0;
    let checkOutCount = 0;
    
    for (const record of records) {
      await client.query(
        `INSERT INTO attendance_records (employee_id, nfc_id, tag_type, tag_time)
         VALUES ($1, $2, $3, $4)`,
        [record.employee_id, record.nfc_id, record.tag_type, record.tag_time]
      );
      
      if (record.tag_type === 'check_in') {
        checkInCount++;
      } else {
        checkOutCount++;
      }
    }

    await client.query('COMMIT');
    
    console.log('✅ Seed 완료!');

    res.json({
      success: true,
      message: '테스트 데이터가 생성되었습니다!',
      data: {
        employees: sampleEmployees.length,
        checkIn: checkInCount,
        checkOut: checkOutCount,
        total: records.length
      }
    });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('❌ Seed 실패:', error);
    res.status(500).json({
      success: false,
      message: 'Seed 실행 중 오류가 발생했습니다.',
      error: error.message
    });
  } finally {
    client.release();
  }
});

export default router;
