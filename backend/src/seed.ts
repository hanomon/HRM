import pool from './config/database';

// Sample data for testing
const sampleEmployees = [
  {
    nfc_id: '04A1B2C3D4E5F6',
    name: '김철수',
    department: '개발팀',
    position: '팀장',
    email: 'kim@company.com',
    phone: '010-1234-5678'
  },
  {
    nfc_id: '04B2C3D4E5F6A1',
    name: '이영희',
    department: '기획팀',
    position: '대리',
    email: 'lee@company.com',
    phone: '010-2345-6789'
  },
  {
    nfc_id: '04C3D4E5F6A1B2',
    name: '박민수',
    department: '개발팀',
    position: '사원',
    email: 'park@company.com',
    phone: '010-3456-7890'
  }
];

// 날짜 생성 헬퍼 함수 (지난 N일 전)
function getDaysAgo(days: number, hours: number = 9, minutes: number = 0): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

// 샘플 출퇴근 기록 데이터 (최근 7일간)
function generateAttendanceRecords(employeeIds: { [key: string]: number }) {
  const records: Array<{
    employee_id: number;
    nfc_id: string;
    tag_type: 'check_in' | 'check_out';
    tag_time: Date;
  }> = [];

  // 지난 7일간의 데이터 생성
  for (let day = 6; day >= 0; day--) {
    // 김철수
    records.push({
      employee_id: employeeIds['04A1B2C3D4E5F6'],
      nfc_id: '04A1B2C3D4E5F6',
      tag_type: 'check_in',
      tag_time: getDaysAgo(day, 8, 45 + Math.floor(Math.random() * 20)) // 8:45~9:05
    });
    records.push({
      employee_id: employeeIds['04A1B2C3D4E5F6'],
      nfc_id: '04A1B2C3D4E5F6',
      tag_type: 'check_out',
      tag_time: getDaysAgo(day, 18, 30 + Math.floor(Math.random() * 30)) // 18:30~19:00
    });

    // 이영희
    records.push({
      employee_id: employeeIds['04B2C3D4E5F6A1'],
      nfc_id: '04B2C3D4E5F6A1',
      tag_type: 'check_in',
      tag_time: getDaysAgo(day, 8, 50 + Math.floor(Math.random() * 15)) // 8:50~9:05
    });
    records.push({
      employee_id: employeeIds['04B2C3D4E5F6A1'],
      nfc_id: '04B2C3D4E5F6A1',
      tag_type: 'check_out',
      tag_time: getDaysAgo(day, 18, 0 + Math.floor(Math.random() * 20)) // 18:00~18:20
    });

    // 박민수 - 2일 전에는 지각
    const checkInHour = day === 2 ? 9 : 8;
    const checkInMinute = day === 2 ? 15 : 55;
    records.push({
      employee_id: employeeIds['04C3D4E5F6A1B2'],
      nfc_id: '04C3D4E5F6A1B2',
      tag_type: 'check_in',
      tag_time: getDaysAgo(day, checkInHour, checkInMinute + Math.floor(Math.random() * 10))
    });
    records.push({
      employee_id: employeeIds['04C3D4E5F6A1B2'],
      nfc_id: '04C3D4E5F6A1B2',
      tag_type: 'check_out',
      tag_time: getDaysAgo(day, 18, 10 + Math.floor(Math.random() * 25)) // 18:10~18:35
    });
  }

  // 오늘은 출근만 기록 (퇴근 전)
  records.push({
    employee_id: employeeIds['04A1B2C3D4E5F6'],
    nfc_id: '04A1B2C3D4E5F6',
    tag_type: 'check_in',
    tag_time: getDaysAgo(0, 8, 47)
  });
  records.push({
    employee_id: employeeIds['04B2C3D4E5F6A1'],
    nfc_id: '04B2C3D4E5F6A1',
    tag_type: 'check_in',
    tag_time: getDaysAgo(0, 8, 52)
  });
  records.push({
    employee_id: employeeIds['04C3D4E5F6A1B2'],
    nfc_id: '04C3D4E5F6A1B2',
    tag_type: 'check_in',
    tag_time: getDaysAgo(0, 8, 58)
  });

  return records;
}

async function seedDatabase() {
  const client = await pool.connect();

  try {
    console.log('🌱 데이터베이스 시딩 시작...\n');

    // Check if employees already exist
    const countResult = await client.query('SELECT COUNT(*) as count FROM employees');
    const existingCount = parseInt(countResult.rows[0].count);
    
    // Check for --force flag
    const forceMode = process.argv.includes('--force') || process.argv.includes('-f');
    
    if (existingCount > 0) {
      console.log('⚠️  이미 직원 데이터가 존재합니다.');
      console.log(`현재 등록된 직원 수: ${existingCount}명\n`);
      
      if (forceMode) {
        console.log('🔄 --force 옵션으로 기존 데이터를 삭제합니다...\n');
        await client.query('DELETE FROM attendance_records');
        await client.query('DELETE FROM employees');
        console.log('✅ 기존 데이터가 삭제되었습니다.\n');
        await insertSampleData(client);
      } else {
        const readline = require('readline').createInterface({
          input: process.stdin,
          output: process.stdout
        });
        
        readline.question('기존 데이터를 삭제하고 새로 시작하시겠습니까? (yes/no): ', async (answer: string) => {
          if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
            await client.query('DELETE FROM attendance_records');
            await client.query('DELETE FROM employees');
            console.log('✅ 기존 데이터가 삭제되었습니다.\n');
            await insertSampleData(client);
          } else {
            console.log('❌ 시딩이 취소되었습니다.');
          }
          readline.close();
          client.release();
          await pool.end();
        });
        return; // Don't release client yet
      }
    } else {
      await insertSampleData(client);
    }
  } catch (error) {
    console.error('❌ 시딩 중 오류 발생:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

async function insertSampleData(client: any) {
  await client.query('BEGIN');

  try {
    // 1. 직원 데이터 추가
    console.log('👥 직원 데이터 추가 중...\n');

    const employeeIds: { [key: string]: number } = {};

    for (const employee of sampleEmployees) {
      const result = await client.query(
        `INSERT INTO employees (nfc_id, name, department, position, email, phone)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
        [employee.nfc_id, employee.name, employee.department, employee.position, employee.email, employee.phone]
      );
      employeeIds[employee.nfc_id] = result.rows[0].id;
      console.log(`✅ ${employee.name} 추가됨 (ID: ${employeeIds[employee.nfc_id]}, NFC ID: ${employee.nfc_id})`);
    }

    console.log(`\n🎉 총 ${sampleEmployees.length}명의 직원이 추가되었습니다!`);

    // 2. 출퇴근 기록 추가
    console.log('\n🏷️  NFC 태깅 기록 추가 중...\n');

    const attendanceRecords = generateAttendanceRecords(employeeIds);
    let checkInCount = 0;
    let checkOutCount = 0;

    for (const record of attendanceRecords) {
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

    console.log(`✅ 출근 기록 ${checkInCount}건 추가됨`);
    console.log(`✅ 퇴근 기록 ${checkOutCount}건 추가됨`);
    console.log(`\n📊 총 ${attendanceRecords.length}건의 NFC 태깅 기록이 추가되었습니다!`);

    // 3. 요약 정보 출력
    console.log('\n📝 테스트용 NFC ID:');
    sampleEmployees.forEach(emp => {
      console.log(`   ${emp.name}: ${emp.nfc_id}`);
    });
    console.log('\n💡 최근 7일간의 출퇴근 기록이 자동으로 생성되었습니다.');
    console.log('   대시보드에서 기록을 확인할 수 있습니다.\n');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  }
}

seedDatabase();
