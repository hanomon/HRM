# HRM 프로젝트 컨텍스트

## 프로젝트 개요
**NFC 기반 근태관리 시스템** - Android 태블릿에서 NFC 카드 태깅으로 직원 출퇴근을 관리하는 풀스택 웹 애플리케이션

## 기술 스택

### Frontend (frontend/)
- React 18.2.0 + TypeScript
- Vite 5.0 (빌드 도구)
- Tailwind CSS 3.4 (스타일링)
- React Router DOM v6 (라우팅)
- Axios (HTTP 클라이언트)
- 포트: 5173 (개발)

### Backend (backend/)
- Express.js 4.18 + TypeScript
- Node.js 18+
- PostgreSQL (데이터베이스)
- XLSX (Excel 내보내기)
- 포트: 3000

## 프로젝트 구조

```
D:\HRM/
├── backend/src/
│   ├── index.ts              # Express 서버 진입점
│   ├── config/database.ts    # PostgreSQL 연결 및 테이블 초기화
│   ├── controllers/
│   │   ├── employeeController.ts
│   │   ├── attendanceController.ts
│   │   └── infoController.ts
│   ├── models/
│   │   ├── employee.ts       # 직원 데이터 모델
│   │   └── attendance.ts     # 출퇴근 기록 모델
│   ├── routes/
│   │   ├── employees.ts
│   │   ├── attendance.ts
│   │   ├── info.ts
│   │   └── seed.ts
│   └── utils/nfcUtils.ts     # NFC ID 정규화
│
├── frontend/src/
│   ├── main.tsx              # React 진입점
│   ├── App.tsx               # 메인 앱 (라우터 설정)
│   ├── pages/
│   │   ├── NFCTagPage.tsx    # NFC 태깅 (/)
│   │   ├── DashboardPage.tsx # 대시보드 (/dashboard)
│   │   └── EmployeesPage.tsx # 직원 관리 (/employees)
│   ├── services/api.ts       # Axios API 클라이언트
│   └── types/index.ts        # TypeScript 타입 정의
```

## 데이터베이스 스키마

### employees 테이블
| 컬럼 | 타입 | 설명 |
|-----|------|------|
| id | SERIAL PK | 직원 ID |
| nfc_id | VARCHAR UNIQUE | NFC 카드 ID |
| name | VARCHAR | 이름 |
| department | VARCHAR | 부서 |
| position | VARCHAR | 직책 |
| email | VARCHAR | 이메일 |
| phone | VARCHAR | 전화번호 |

### attendance_records 테이블
| 컬럼 | 타입 | 설명 |
|-----|------|------|
| id | SERIAL PK | 기록 ID |
| employee_id | INTEGER FK | 직원 ID |
| nfc_id | VARCHAR | NFC ID |
| tag_type | VARCHAR | 'check_in' 또는 'check_out' |
| tag_time | TIMESTAMP | 태깅 시간 |

## API 엔드포인트

### 직원 (/api/employees)
- `GET /` - 전체 직원 조회
- `GET /:id` - ID로 조회
- `GET /nfc/:nfc_id` - NFC ID로 조회
- `POST /` - 직원 생성
- `PUT /:id` - 직원 수정
- `DELETE /:id` - 직원 삭제

### 출퇴근 (/api/attendance)
- `GET /` - 전체 기록 (날짜 필터 가능)
- `GET /employee/:employeeId` - 직원별 기록
- `GET /export/excel` - Excel 내보내기
- `POST /` - 새 기록 생성 (NFC 태깅)
  - Body: `{ "nfc_id": "...", "action": "check_in" | "check_out" }`
  - `action` 생략 시 자동 판단 (기존 방식)
- `DELETE /:id` - 기록 삭제

## 주요 기능

1. **NFC 태깅**: Web NFC API로 카드 인식, 자동 출/퇴근 판단
2. **직원 관리**: CRUD, NFC ID 중복 검사
3. **출퇴근 기록**: 날짜 필터링, 통계, Excel 내보내기
4. **대시보드**: 실시간 통계 (전체/출근/퇴근 건수)

## 개발 명령어

```bash
# 루트에서 전체 설치
npm run install:all

# 개발 서버 (동시 실행)
npm run dev

# 백엔드만
cd backend && npm run dev

# 프론트엔드만
cd frontend && npm run dev

# 빌드
npm run build
```

## 환경 변수

### Backend (.env)
```
DATABASE_URL=postgresql://user:password@localhost:5432/hrm
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:3000/api
```

## 배포
- Render, Vercel, Railway 지원
- 설정 파일: render.yaml, railway.json, railway.toml, nixpacks.toml

## 참고사항
- NFC ID는 자동으로 정규화됨 (콜론 제거, 대문자 변환)
- 출/퇴근 판단: `action` 파라미터로 명시적 지정 가능, 생략 시 자동 판단
- Web NFC API는 Android Chrome에서만 지원
