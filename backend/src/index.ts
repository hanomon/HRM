import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import employeeRoutes from './routes/employees';
import attendanceRoutes from './routes/attendance';
import seedRoutes from './routes/seed';

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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '서버가 정상 작동중입니다.' });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: '서버 오류가 발생했습니다.' });
});

app.listen(PORT, () => {
  console.log(`🚀 서버가 포트 ${PORT}에서 실행중입니다.`);
  console.log(`📡 API: http://localhost:${PORT}/api`);
});

