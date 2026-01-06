# 📚 개발 문서 모음

NFC 기반 근태관리 시스템의 모든 문서를 한 곳에서 찾을 수 있습니다.

## 🎯 시작하기

### 처음 시작하는 개발자

1. **[빠른 시작 가이드](../QUICKSTART.md)** ⚡
   - 5분 만에 프로젝트 실행하기
   - 테스트 데이터 생성
   - 기본 기능 테스트

2. **[README](../README.md)** 📖
   - 프로젝트 전체 개요
   - 상세 설치 가이드
   - API 문서
   - 배포 가이드

## 📸 문서화

### 스크린샷 추가하기

- **[스크린샷 가이드](SCREENSHOT_GUIDE.md)**
  - 필요한 스크린샷 목록
  - 촬영 방법 및 팁
  - 파일명 규칙

- **[Placeholder 생성기](generate-placeholders.html)**
  - 브라우저에서 열어서 임시 이미지 생성
  - 실제 스크린샷 전까지 사용

## 🏗️ 아키텍처

### 프로젝트 구조

```
HRM/
├── backend/              # Node.js + Express + SQLite
│   ├── src/
│   │   ├── config/      # DB 설정
│   │   ├── models/      # 데이터 모델
│   │   ├── controllers/ # API 로직
│   │   └── routes/      # API 라우트
│   └── attendance.db    # SQLite 데이터베이스
│
├── frontend/            # React + TypeScript + Vite
│   ├── src/
│   │   ├── pages/      # 페이지 컴포넌트
│   │   ├── services/   # API 통신
│   │   └── types/      # TypeScript 타입
│   └── dist/           # 빌드 결과물
│
└── docs/               # 문서 폴더 (현재 위치)
    ├── images/         # 스크린샷
    └── README.md       # 이 문서
```

### 기술 스택

**Backend:**
- Node.js + Express
- TypeScript
- SQLite (better-sqlite3)
- XLSX (Excel 생성)

**Frontend:**
- React 18
- TypeScript
- Vite
- TailwindCSS
- Web NFC API

## 🔧 개발 가이드

### 환경 설정

```bash
# 의존성 설치
npm run install:all

# 테스트 데이터 생성
cd backend && npm run seed -- --force

# 개발 서버 실행
npm run dev
```

### 개발 모드 명령어

```bash
# Backend만 실행 (포트 3000)
npm run dev:backend

# Frontend만 실행 (포트 5173)
npm run dev:frontend

# Backend + Frontend 동시 실행
npm run dev
```

### 빌드

```bash
# Backend 빌드
cd backend
npm run build

# Frontend 빌드
cd frontend
npm run build
```

## 🧪 테스트

### 테스트 데이터

```bash
# 테스트 데이터 생성/재생성
cd backend
npm run seed -- --force
```

**생성되는 데이터:**
- 직원 3명 (김철수, 이영희, 박민수)
- 최근 7일간 출퇴근 기록 45건

### API 테스트

**직원 조회:**
```bash
curl http://localhost:3000/api/employees
```

**NFC 태깅 시뮬레이션:**
```bash
curl -X POST http://localhost:3000/api/attendance \
  -H "Content-Type: application/json" \
  -d '{"nfc_id":"04:A1:B2:C3:D4:E5:F6"}'
```

### 브라우저 콘솔 테스트

F12를 눌러 콘솔을 열고:

```javascript
// 출근 태깅
fetch('http://localhost:3000/api/attendance', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ nfc_id: '04:A1:B2:C3:D4:E5:F6' })
})
.then(res => res.json())
.then(console.log);
```

## 📊 데이터베이스

### 스키마

**employees (직원 테이블)**
```sql
- id: INTEGER PRIMARY KEY
- nfc_id: TEXT UNIQUE      -- NFC 카드 ID
- name: TEXT               -- 이름
- department: TEXT         -- 부서
- position: TEXT           -- 직책
- email: TEXT              -- 이메일
- phone: TEXT              -- 전화번호
- created_at: DATETIME
- updated_at: DATETIME
```

**attendance_records (출퇴근 기록)**
```sql
- id: INTEGER PRIMARY KEY
- employee_id: INTEGER     -- 직원 ID (FK)
- nfc_id: TEXT            -- NFC 카드 ID
- tag_type: TEXT          -- 'check_in' 또는 'check_out'
- tag_time: DATETIME      -- 태깅 시간
- created_at: DATETIME
```

### DB 관리

```bash
# DB 초기화
cd backend
rm attendance.db
npm run dev  # 자동 재생성

# DB 백업
cp attendance.db attendance.backup.db

# DB 복원
cp attendance.backup.db attendance.db
```

## 🌐 API 엔드포인트

### 직원 관리
- `GET /api/employees` - 전체 직원 조회
- `GET /api/employees/:id` - 특정 직원 조회
- `GET /api/employees/nfc/:nfc_id` - NFC ID로 조회
- `POST /api/employees` - 직원 추가
- `PUT /api/employees/:id` - 직원 수정
- `DELETE /api/employees/:id` - 직원 삭제

### 출퇴근 기록
- `GET /api/attendance` - 기록 조회 (쿼리: start_date, end_date)
- `POST /api/attendance` - 태깅 기록 생성 (body: {nfc_id})
- `DELETE /api/attendance/:id` - 기록 삭제
- `GET /api/attendance/export/excel` - Excel 다운로드

자세한 내용은 [README.md](../README.md#-api-엔드포인트)를 참조하세요.

## 🐛 디버깅

### 로그 확인

**Backend 로그:**
- 터미널에서 Backend 서버 실행 시 로그 표시
- `console.log()` 추가로 디버깅

**Frontend 로그:**
- 브라우저 개발자 도구 (F12) → Console 탭
- Network 탭에서 API 요청/응답 확인

### 자주 발생하는 오류

**1. Port already in use**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID [PID] /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

**2. CORS 오류**
- `backend/src/index.ts`에서 CORS 설정 확인
- Frontend URL이 허용 목록에 있는지 확인

**3. NFC가 작동하지 않음**
- Android 기기인지 확인 (iOS 지원 안 함)
- Chrome/Edge 브라우저 사용
- HTTPS 연결 (로컬은 localhost 예외)

## 🚀 배포

### Backend 배포

**추천 플랫폼:**
- Railway
- Render
- Heroku

**환경변수:**
```env
PORT=3000
NODE_ENV=production
DATABASE_PATH=./attendance.db
```

### Frontend 배포

**추천 플랫폼:**
- Vercel (추천)
- Netlify

**빌드:**
```bash
cd frontend
npm run build
# dist 폴더를 배포
```

**주의**: API URL을 프로덕션 주소로 변경 필요

## 📝 코딩 컨벤션

### TypeScript
- 엄격한 타입 체크 사용
- `any` 타입 최소화
- 인터페이스 우선 사용

### React
- 함수형 컴포넌트 사용
- Hooks 활용 (useState, useEffect)
- Props 타입 명시

### 파일명
- 컴포넌트: PascalCase (예: `EmployeePage.tsx`)
- 유틸리티: camelCase (예: `api.ts`)
- 타입: PascalCase (예: `Employee`)

### Git Commit
```
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 수정
style: 코드 포맷팅
refactor: 코드 리팩토링
test: 테스트 추가
chore: 빌드, 설정 변경
```

## 🤝 기여하기

1. Fork the Project
2. Create Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit Changes (`git commit -m 'feat: Add some AmazingFeature'`)
4. Push to Branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📞 지원

- 🐛 버그 리포트: GitHub Issues
- 💡 기능 제안: GitHub Discussions
- 📧 문의: 프로젝트 관리자에게 연락

## 📚 참고 자료

### 공식 문서
- [Web NFC API](https://developer.mozilla.org/en-US/docs/Web/API/Web_NFC_API)
- [React](https://react.dev/)
- [Express.js](https://expressjs.com/)
- [SQLite](https://www.sqlite.org/)
- [TypeScript](https://www.typescriptlang.org/)

### 관련 도구
- [Postman](https://www.postman.com/) - API 테스트
- [DB Browser for SQLite](https://sqlitebrowser.org/) - DB 관리
- [VS Code](https://code.visualstudio.com/) - 코드 에디터

---

**마지막 업데이트**: 2026-01-01  
**관리자**: HRM 개발팀

