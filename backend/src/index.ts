import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import employeeRoutes from './routes/employees';
import attendanceRoutes from './routes/attendance';
import seedRoutes from './routes/seed';
import infoRoutes from './routes/info';
import pool, { initializeDatabase } from './config/database';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL || '',
  // Vercel 배포 URL 패턴 허용
  /^https:\/\/.*\.vercel\.app$/,
  // Render 배포 URL 패턴 허용
  /^https:\/\/.*\.onrender\.com$/
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // origin이 없는 경우 (모바일 앱, Postman 등)
    if (!origin) return callback(null, true);
    
    // 허용된 origin인지 확인
    const isAllowed = allowedOrigins.some(allowed => {
      if (typeof allowed === 'string') {
        return allowed === origin;
      } else if (allowed instanceof RegExp) {
        return allowed.test(origin);
      }
      return false;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/employees', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/seed', seedRoutes);
app.use('/api/info', infoRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '서버가 정상 작동중입니다.' });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: '서버 오류가 발생했습니다.' });
});

// 서버 시작 시 자동으로 테스트 데이터 생성 (프로덕션 환경에서만)
async function initializeProductionData() {
  try {
    // 직원 수 확인
    const result = await pool.query('SELECT COUNT(*) as count FROM employees');
    const employeeCount = parseInt(result.rows[0].count);
    
    if (employeeCount === 0 && process.env.NODE_ENV === 'production') {
      console.log('🌱 데이터베이스가 비어있습니다. 테스트 데이터를 생성합니다...');
      
      // Seed 데이터 생성
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
      for (const employee of sampleEmployees) {
        await pool.query(
          `INSERT INTO employees (nfc_id, name, department, position, email, phone)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [employee.nfc_id, employee.name, employee.department, employee.position, employee.email, employee.phone]
        );
      }

      console.log('✅ 테스트 데이터 생성 완료!');
      console.log(`   - 직원 ${sampleEmployees.length}명 추가`);
    } else if (employeeCount > 0) {
      console.log(`✅ 기존 데이터 확인: 직원 ${employeeCount}명`);
    }
  } catch (error) {
    console.error('❌ 데이터베이스 초기화 실패:', error);
  }
}

app.listen(PORT, async () => {
  console.log(`🚀 서버가 포트 ${PORT}에서 실행중입니다.`);
  console.log(`📡 API: http://localhost:${PORT}/api`);
  console.log(`🌍 환경: ${process.env.NODE_ENV || 'development'}`);
  
  // 데이터베이스 초기화
  try {
    await initializeDatabase();
    await initializeProductionData();
  } catch (error) {
    console.error('❌ 초기화 중 오류 발생:', error);
  }
});
