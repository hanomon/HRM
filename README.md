# 🏢 NFC 기반 근태관리 시스템

Android 태블릿에서 NFC 태깅을 통해 직원들의 출퇴근을 관리하는 웹 애플리케이션입니다.

![메인 화면](docs/images/dashboard.png)

## 🌐 라이브 데모
- **Frontend**: [https://hrm-frontend-3tph.onrender.com](https://hrm-frontend-3tph.onrender.com)
- **Backend API**: [https://hrm-backend-1dk5.onrender.com/api](https://hrm-backend-1dk5.onrender.com/api)
- **Health Check**: [https://hrm-backend-1dk5.onrender.com/api/health](https://hrm-backend-1dk5.onrender.com/api/health)

> 🔄 **최신 업데이트**: SQLite → **PostgreSQL** 마이그레이션 완료!  
> ✅ 데이터 영구 저장, 서버 재시작해도 데이터 유지

## 📋 목차
- [주요 기능](#-주요-기능)
- [빠른 시작](#-빠른-시작)
- [상세 설치 가이드](#-상세-설치-가이드)
- [사용 방법](#-사용-방법)
- [테스트 데이터](#-테스트-데이터)
- [기술 스택](#️-기술-스택)
- [프로젝트 구조](#️-프로젝트-구조)
- [API 문서](#-api-엔드포인트)
- [배포 가이드](#-프로덕션-배포)
  - **[Google Cloud 마이그레이션 가이드](GOOGLE_CLOUD_MIGRATION.md)** 🚀 ⭐ NEW
- [문제 해결](#-문제-해결)
- [기여하기](#-기여)
- **[NFC 통합 가이드](docs/NFC_INTEGRATION_GUIDE.md)** ⭐

## ✨ 주요 기능

### 📱 NFC 태깅으로 간편한 출퇴근 체크
- Android 태블릿에서 Web NFC API를 활용
- 카드를 태블릿에 태깅하면 자동으로 출근/퇴근 기록
- 마지막 태깅 기록에 따라 자동으로 출근/퇴근 구분

![NFC 태깅 화면](docs/images/nfc-tagging.png)

### 👥 직원 관리
- 직원 정보 등록 (이름, 부서, 직책, NFC ID 등)
- 직원 정보 수정 및 삭제
- NFC 카드와 직원 매칭

![직원 관리 화면](docs/images/employees.png)

### 📊 출퇴근 기록 조회 및 통계
- 날짜별 출퇴근 기록 조회
- 직원별 근무 시간 통계
- 실시간 출근 현황 확인

![대시보드 화면](docs/images/dashboard.png)

### 📥 Excel 내보내기
- 출퇴근 기록을 Excel 파일로 다운로드
- 급여 계산 및 정산에 활용 가능

## 🚀 빠른 시작

### 전제 조건
- **Node.js** v18 이상 설치 필요
- **PostgreSQL** (로컬 개발 시) 또는 Render 무료 PostgreSQL
- **Android 태블릿** (NFC 지원, Chrome 브라우저)
- **NFC 카드** (직원용)

### 3분 만에 시작하기

```bash
# 1. 저장소 클론
git clone <repository-url>
cd HRM

# 2. 모든 의존성 설치
npm run install:all

# 3. 테스트 데이터 생성
cd backend
npm run seed -- --force
cd ..

# 4. 개발 서버 실행 (Backend + Frontend 동시 실행)
npm run dev
```

**접속 URL:**
- 🖥️ **로컬 개발**: http://localhost:5173
- 🌐 **라이브 데모**: https://hrm-frontend-3tph.onrender.com

## 📦 상세 설치 가이드

### 1단계: 저장소 클론 및 의존성 설치

```bash
# 저장소 클론
git clone <repository-url>
cd HRM

# 모든 패키지 설치 (Backend + Frontend)
npm run install:all
```

또는 개별 설치:
```bash
# Backend 설치
cd backend
npm install

# Frontend 설치
cd ../frontend
npm install
```

### 2단계: 환경변수 설정

Backend 디렉토리에 `.env` 파일 생성:

```bash
cd backend
```

`.env` 파일 내용:
```env
PORT=3000
NODE_ENV=development
DATABASE_URL=postgres://postgres:password@localhost:5432/hrm_db
FRONTEND_URL=http://localhost:5173
```

> 💡 **PostgreSQL 로컬 설정:**
> ```bash
> # Docker 사용 (추천)
> docker run --name hrm-postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres
> 
> # 데이터베이스 생성
> docker exec -it hrm-postgres psql -U postgres -c "CREATE DATABASE hrm_db;"
> ```

### 3단계: 데이터베이스 초기화 및 테스트 데이터 생성

```bash
cd backend
npm run seed -- --force
```

이 명령은 다음을 생성합니다:
- ✅ 3명의 샘플 직원 데이터
- ✅ 최근 7일간의 출퇴근 기록 (45건)

### 4단계: 서버 실행

**루트 디렉토리에서 실행 (추천)**
```bash
npm run dev
```
Backend(포트 3000)와 Frontend(포트 5173)가 동시에 실행됩니다.

**개별 실행**
```bash
# Backend만 실행
npm run dev:backend

# Frontend만 실행  
npm run dev:frontend
```

### 5단계: 접속

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000/api

## 📱 사용 방법

### 1️⃣ 직원 등록하기

1. 웹 애플리케이션에 접속
2. 상단 메뉴에서 **"직원 관리"** 클릭
3. **"직원 추가"** 버튼 클릭
4. 직원 정보 입력:
   - **이름**: 직원 이름
   - **NFC ID**: NFC 카드의 시리얼 번호 (예: `04A1B2C3D4E5F6`)
   - **부서**: 소속 부서
   - **직책**: 직급/직책
   - **이메일**: 이메일 주소
   - **전화번호**: 연락처
5. **"저장"** 버튼 클릭

![직원 추가 화면](docs/images/add-employee.png)

> 💡 **NFC ID 형식**: 
> - 숫자와 알파벳(A-F) 조합만 허용 (예: `04A1B2C3D4E5F6`)
> - 콜론(`:`) 제거된 형식 사용 ✅
> - 입력 시 자동으로 정규화 처리
> - NFC 카드의 시리얼 번호 확인 또는 "NFC 태깅" 페이지에서 스캔하여 확인

### 2️⃣ NFC 태깅 설정하기 (Android 태블릿)

1. Android 태블릿에서 **Chrome 브라우저** 열기
2. 다음 URL 중 하나로 접속:
   - 🌐 **라이브 데모**: https://hrm-frontend-3tph.onrender.com
   - 🏠 **로컬 개발**: http://[서버IP]:5173
3. 상단 메뉴에서 **"NFC 태깅"** 클릭
4. **"NFC 스캔 시작"** 버튼 클릭
5. NFC 권한 요청이 나타나면 **"허용"** 클릭
6. 스캔 대기 화면이 표시됨
7. 태블릿을 출입구 근처에 고정 설치

![NFC 태깅 설정](docs/images/nfc-setup.png)

> ⚠️ **중요**: 
> - Web NFC API는 **Android의 Chrome/Edge 브라우저**에서만 작동
> - iOS(iPhone/iPad)는 지원하지 않음
> - **HTTPS 연결** 필요 (로컬 개발 시 localhost는 예외)

### 3️⃣ 출퇴근 태깅하기

1. 직원이 NFC 카드를 태블릿에 가까이 대기
2. 자동으로 NFC ID 인식
3. 출근/퇴근 자동 판단:
   - **출근**: 오늘 첫 태깅 또는 마지막 기록이 퇴근인 경우
   - **퇴근**: 오늘 마지막 기록이 출근인 경우
4. 화면에 결과 표시:
   - ✅ 성공: 직원 이름, 시간, 출근/퇴근 표시
   - ❌ 실패: 오류 메시지 표시

![태깅 성공 화면](docs/images/tag-success.png)

### 4️⃣ 기록 조회 및 Excel 내보내기

1. 상단 메뉴에서 **"대시보드"** 또는 **"기록 조회"** 클릭
2. 날짜 필터 설정 (선택사항):
   - 시작 날짜 선택
   - 종료 날짜 선택
3. 출퇴근 기록 확인
4. **"Excel 내보내기"** 버튼 클릭
5. Excel 파일 자동 다운로드

![Excel 내보내기](docs/images/export-excel.png)

## 🧪 테스트 데이터

시스템을 빠르게 테스트하기 위한 샘플 데이터가 제공됩니다.

### 로컬 개발 환경에서 생성

```bash
cd backend
npm run seed -- --force
```

### 배포된 환경에서 생성 (Seed API 사용)

브라우저 콘솔(F12)에서 실행:

```javascript
// 라이브 데모 환경
fetch('https://hrm-backend-1dk5.onrender.com/api/seed', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
})
.then(res => res.json())
.then(data => {
  console.log('✅ 테스트 데이터 생성 완료!', data);
  alert('테스트 데이터가 생성되었습니다! 페이지를 새로고침하세요.');
});

// 로컬 개발 환경
fetch('http://localhost:3000/api/seed', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
})
.then(res => res.json())
.then(data => console.log(data));
```

또는 cURL로 실행:

```bash
# 라이브 데모
curl -X POST https://hrm-backend-1dk5.onrender.com/api/seed

# 로컬 개발
curl -X POST http://localhost:3000/api/seed
```

### 생성되는 데이터

#### 👥 직원 3명
| 이름 | 부서 | 직책 | NFC ID |
|------|------|------|--------|
| 김철수 | 개발팀 | 팀장 | `04A1B2C3D4E5F6` |
| 이영희 | 기획팀 | 대리 | `04:B2:C3:D4:E5:F6:A1` |
| 박민수 | 개발팀 | 사원 | `04:C3:D4:E5:F6:A1:B2` |

#### 📊 출퇴근 기록
- **최근 7일간** 출퇴근 데이터 자동 생성
- **총 45건**의 기록 (출근 24건, 퇴근 21건)
- 현실적인 시간대:
  - 김철수: 8:45~9:05 출근, 18:30~19:00 퇴근
  - 이영희: 8:50~9:05 출근, 18:00~18:20 퇴근
  - 박민수: 8:55~9:05 출근, 18:10~18:35 퇴근
- 특별 케이스: 박민수는 2일 전 지각 기록 포함 (9:15 출근)

### 실제 NFC 카드 없이 테스트하기

브라우저 개발자 도구(F12)를 사용하여 테스트할 수 있습니다:

```javascript
// 라이브 데모 환경에서 출근 태깅 테스트
fetch('https://hrm-backend-1dk5.onrender.com/api/attendance', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ nfc_id: '04A1B2C3D4E5F6' })
})
.then(res => res.json())
.then(data => {
  console.log('✅ 태깅 결과:', data);
  alert(`${data.employee_name} - ${data.tag_type === 'check_in' ? '출근' : '퇴근'} 완료!`);
});

// 로컬 개발 환경
fetch('http://localhost:3000/api/attendance', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ nfc_id: '04A1B2C3D4E5F6' })
})
.then(res => res.json())
.then(data => console.log(data));
```

**여러 직원 연속 태깅 시뮬레이션:**
```javascript
const employees = [
  '04A1B2C3D4E5F6',  // 김철수
  '04:B2:C3:D4:E5:F6:A1',  // 이영희
  '04:C3:D4:E5:F6:A1:B2'   // 박민수
];

async function simulateTagging() {
  for (const nfcId of employees) {
    const res = await fetch('https://hrm-backend-1dk5.onrender.com/api/attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nfc_id: nfcId })
    });
    const data = await res.json();
    console.log(`✅ ${data.employee_name}: ${data.tag_type === 'check_in' ? '출근' : '퇴근'}`);
  }
  alert('모든 직원 태깅 완료! 페이지를 새로고침하세요.');
}

simulateTagging();
```

## 🛠️ 기술 스택

### Backend
| 기술 | 용도 |
|------|------|
| Node.js | 서버 런타임 |
| Express | 웹 프레임워크 |
| TypeScript | 타입 안정성 |
| **PostgreSQL** | **데이터베이스 (영구 저장)** |
| **pg** | **PostgreSQL 드라이버** |
| XLSX | Excel 파일 생성 |

### Frontend
| 기술 | 용도 |
|------|------|
| React 18 | UI 라이브러리 |
| TypeScript | 타입 안정성 |
| Vite | 빌드 도구 |
| TailwindCSS | 스타일링 |
| React Router | 페이지 라우팅 |
| Axios | HTTP 통신 |
| Web NFC API | NFC 태그 읽기 |

## 🏗️ 프로젝트 구조

```
HRM/
├── backend/                    # Backend API 서버
│   ├── src/
│   │   ├── config/
│   │   │   └── database.ts    # PostgreSQL 연결 풀 설정
│   │   ├── models/
│   │   │   ├── employee.ts    # 직원 모델
│   │   │   └── attendance.ts  # 출퇴근 모델
│   │   ├── controllers/
│   │   │   ├── employeeController.ts
│   │   │   └── attendanceController.ts
│   │   ├── routes/
│   │   │   ├── employees.ts   # 직원 API 라우트
│   │   │   ├── attendance.ts  # 출퇴근 API 라우트
│   │   │   └── seed.ts        # 테스트 데이터 생성 API
│   │   ├── seed.ts            # 테스트 데이터 생성 스크립트 (CLI)
│   │   └── index.ts           # 서버 진입점
│   ├── .env.example           # 환경변수 예시
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                  # React 프론트엔드
│   ├── src/
│   │   ├── pages/
│   │   │   ├── DashboardPage.tsx      # 대시보드
│   │   │   ├── EmployeesPage.tsx      # 직원 관리
│   │   │   └── NFCTagPage.tsx         # NFC 태깅
│   │   ├── services/
│   │   │   └── api.ts                 # API 통신
│   │   ├── types/
│   │   │   └── index.ts               # TypeScript 타입
│   │   ├── App.tsx                    # 메인 앱
│   │   └── main.tsx                   # 진입점
│   ├── package.json
│   └── vite.config.ts
│
├── docs/                      # 문서 및 이미지
│   └── images/               # 스크린샷
│
├── package.json              # 루트 패키지 (워크스페이스)
└── README.md                 # 이 문서
```

## 🗄️ 데이터베이스 스키마

### 데이터베이스: PostgreSQL
**영구 저장소로 데이터 보존 보장**

### employees (직원)
```sql
CREATE TABLE employees (
  id SERIAL PRIMARY KEY,
  nfc_id VARCHAR(255) UNIQUE NOT NULL,      -- NFC 카드 ID
  name VARCHAR(255) NOT NULL,               -- 이름
  department VARCHAR(255),                  -- 부서
  position VARCHAR(255),                    -- 직책
  email VARCHAR(255),                       -- 이메일
  phone VARCHAR(50),                        -- 전화번호
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_nfc_id ON employees(nfc_id);
```

### attendance_records (출퇴근 기록)
```sql
CREATE TABLE attendance_records (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL,            -- 직원 ID (FK)
  nfc_id VARCHAR(255) NOT NULL,            -- NFC 카드 ID
  tag_type VARCHAR(50) NOT NULL            -- 'check_in' 또는 'check_out'
    CHECK(tag_type IN ('check_in', 'check_out')),
  tag_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

CREATE INDEX idx_employee_id ON attendance_records(employee_id);
CREATE INDEX idx_tag_time ON attendance_records(tag_time);
```

> ✅ **PostgreSQL 장점:**
> - 데이터 영구 보존 (서버 재시작해도 유지)
> - 프로덕션 환경에 최적화
> - 자동 백업 (Render 제공)
> - 동시 접속 처리 우수

## 🔌 API 엔드포인트

### 직원 관리 API

#### 전체 직원 조회
```http
GET /api/employees
```
**응답 예시:**
```json
[
  {
    "id": 1,
    "nfc_id": "04A1B2C3D4E5F6",
    "name": "김철수",
    "department": "개발팀",
    "position": "팀장",
    "email": "kim@company.com",
    "phone": "010-1234-5678"
  }
]
```

#### 직원 추가
```http
POST /api/employees
Content-Type: application/json

{
  "nfc_id": "04A1B2C3D4E5F6",
  "name": "김철수",
  "department": "개발팀",
  "position": "팀장",
  "email": "kim@company.com",
  "phone": "010-1234-5678"
}
```

#### NFC ID로 직원 조회
```http
GET /api/employees/nfc/:nfc_id
```

#### 직원 수정
```http
PUT /api/employees/:id
```

#### 직원 삭제
```http
DELETE /api/employees/:id
```

### 출퇴근 기록 API

#### 출퇴근 기록 조회
```http
GET /api/attendance?start_date=2024-01-01&end_date=2024-01-31
```

#### NFC 태깅 (출퇴근 기록 생성)
```http
POST /api/attendance
Content-Type: application/json

{
  "nfc_id": "04A1B2C3D4E5F6",
  "action": "check_in"
}
```

| 파라미터 | 타입 | 필수 | 설명 |
|---------|------|------|------|
| `nfc_id` | string | ✅ | NFC 카드 ID |
| `action` | string | ❌ | `check_in` (출근) 또는 `check_out` (퇴근). 생략 시 자동 판단 |

**요청 예시:**
```javascript
// 명시적 출근
{ "nfc_id": "04A1B2C3D4E5F6", "action": "check_in" }

// 명시적 퇴근
{ "nfc_id": "04A1B2C3D4E5F6", "action": "check_out" }

// 자동 판단 (기존 방식, 하위 호환)
{ "nfc_id": "04A1B2C3D4E5F6" }
```

**응답 예시:**
```json
{
  "id": 123,
  "employee_id": 1,
  "employee_name": "김철수",
  "nfc_id": "04A1B2C3D4E5F6",
  "tag_type": "check_in",
  "message": "출근 처리되었습니다."
}
```

**에러 응답 (잘못된 action):**
```json
{
  "error": "유효하지 않은 action입니다. check_in 또는 check_out만 허용됩니다."
}
```

#### Excel 내보내기
```http
GET /api/attendance/export/excel?start_date=2024-01-01&end_date=2024-01-31
```

#### 기록 삭제
```http
DELETE /api/attendance/:id
```

### 🏷️ NFC 출근 정보 API (신규!)

> **📌 NFC ID 형식**: `04A1B2C3D4E5F6` (콜론 없이 숫자와 알파벳만)  
> API는 자동으로 콜론을 제거하고 정규화 처리합니다.

#### GET: NFC ID로 직원 출근 정보 조회
```http
GET /api/info/:nfc_id
```

**예시:**
```http
GET /api/info/04A1B2C3D4E5F6
```

**응답 예시:**
```json
{
  "success": true,
  "employee": {
    "id": 1,
    "nfc_id": "04A1B2C3D4E5F6",
    "name": "김철수",
    "department": "개발팀",
    "position": "팀장",
    "email": "kim@company.com",
    "phone": "010-1234-5678"
  },
  "today": {
    "date": "2026-01-13",
    "records": [
      {
        "id": 1,
        "employee_id": 1,
        "nfc_id": "04A1B2C3D4E5F6",
        "tag_type": "check_in",
        "tag_time": "2026-01-13T08:30:00.000Z"
      }
    ],
    "check_in": {
      "id": 1,
      "tag_type": "check_in",
      "tag_time": "2026-01-13T08:30:00.000Z"
    },
    "check_out": null,
    "is_checked_in": true,
    "is_checked_out": false
  },
  "monthly_stats": {
    "total_days": 10,
    "check_in_count": 10,
    "check_out_count": 9,
    "on_time_count": 8,
    "late_count": 2
  },
  "recent_records": [
    {
      "id": 1,
      "employee_id": 1,
      "nfc_id": "04A1B2C3D4E5F6",
      "tag_type": "check_in",
      "tag_time": "2026-01-13T08:30:00.000Z"
    }
  ],
  "last_tag": {
    "type": "check_in",
    "time": "2026-01-13T08:30:00.000Z"
  }
}
```

#### POST: NFC ID로 직원 출근 정보 조회 (Body 방식)
```http
POST /api/info
Content-Type: application/json

{
  "nfc_id": "04A1B2C3D4E5F6"
}
```

**응답**: GET 방식과 동일

**에러 응답 (직원 없음):**
```json
{
  "error": "NFC ID에 해당하는 직원을 찾을 수 없습니다.",
  "nfc_id": "04A1B2C3D4E5F6"
}
```

**사용 사례:**
- 🏷️ NFC 태깅 시 화면에 직원 정보와 출근 현황 표시
- 📊 실시간 출근 상태 확인
- 📈 월간 출근 통계 표시
- ⏰ 마지막 태그 시간 확인

---

### 테스트 데이터 생성 API

#### Seed 데이터 생성 (테스트용)
```http
POST /api/seed
Content-Type: application/json
```

**응답 예시:**
```json
{
  "success": true,
  "message": "테스트 데이터가 생성되었습니다!",
  "data": {
    "employees": 3,
    "checkIn": 24,
    "checkOut": 21,
    "total": 45
  }
}
```

> ⚠️ **주의**: 이 API는 기존 데이터를 모두 삭제하고 새로운 테스트 데이터를 생성합니다.  
> 프로덕션 환경에서는 환경변수로 비활성화하는 것을 권장합니다.

## 🌐 프로덕션 배포

### 🚀 현재 배포된 환경

이 프로젝트는 **Render**를 통해 배포되어 있습니다:

| 서비스 | URL | 상태 |
|--------|-----|------|
| **PostgreSQL** | hrm-database | ✅ 운영 중 (영구 저장) |
| Frontend | [hrm-frontend-3tph.onrender.com](https://hrm-frontend-3tph.onrender.com) | ✅ 운영 중 |
| Backend API | [hrm-backend-1dk5.onrender.com](https://hrm-backend-1dk5.onrender.com/api) | ✅ 운영 중 |
| Health Check | [/api/health](https://hrm-backend-1dk5.onrender.com/api/health) | ✅ 정상 |

### 배포 아키텍처

```
┌─────────────────────────────────────────────────────┐
│  Render Platform (render.yaml)                       │
├─────────────────────────────────────────────────────┤
│                                                       │
│  ┌─────────────────┐      ┌──────────────────┐     │
│  │  Frontend       │      │  Backend         │     │
│  │  (Vite Preview) │─────▶│  (Express API)   │     │
│  │  Port: 4173     │      │  Port: 3000      │     │
│  └─────────────────┘      └────────┬─────────┘     │
│                                     │                │
│                            ┌────────▼──────────┐    │
│                            │  PostgreSQL DB    │    │
│                            │  (영구 저장소)     │    │
│                            │  - 자동 백업       │    │
│                            │  - 데이터 보존     │    │
│                            └───────────────────┘    │
└─────────────────────────────────────────────────────┘
```

### Backend 배포 상세

**플랫폼**: Render  
**빌드 명령어**: `npm install --include=dev && npm run build`  
**시작 명령어**: `npm start`  
**루트 디렉토리**: `backend`

**환경변수:**
```env
PORT=3000
NODE_ENV=production
DATABASE_URL=<자동 주입 - PostgreSQL 연결 문자열>
FRONTEND_URL=https://hrm-frontend-3tph.onrender.com
```

> 💡 **DATABASE_URL은 자동 설정됩니다:**
> `render.yaml`에서 PostgreSQL과 자동 연결되도록 구성되어 있습니다.

**빌드 스크립트:**
```bash
cd backend
npm run build    # TypeScript 컴파일
npm start        # node dist/index.js 실행
```

### Frontend 배포 상세

**플랫폼**: Render  
**빌드 명령어**: `npm install && npm run build`  
**시작 명령어**: `npm run preview`  
**루트 디렉토리**: `frontend`

**환경변수:**
```env
VITE_API_URL=https://hrm-backend-1dk5.onrender.com/api
PORT=4173
```

**빌드 스크립트:**
```bash
cd frontend
npm run build      # Vite 빌드 (dist 폴더 생성)
npm run preview    # Vite 프리뷰 서버 (프로덕션 모드)
```

### 🔧 자동 배포 설정

이 프로젝트는 `render.yaml` Blueprint를 사용하여 **모노레포 자동 배포**를 구현했습니다:

```yaml
databases:
  # PostgreSQL 데이터베이스
  - name: hrm-database
    plan: free
    databaseName: hrm_db
    user: hrm_user
    region: singapore

services:
  # Backend 서비스
  - type: web
    name: hrm-backend
    runtime: node
    rootDir: backend
    buildCommand: npm install --include=dev && npm run build
    startCommand: npm start
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: hrm-database
          property: connectionString  # 자동 주입!
    
  # Frontend 서비스
  - type: web
    name: hrm-frontend
    runtime: node
    rootDir: frontend
    buildCommand: npm install && npm run build
    startCommand: npm run preview
```

**장점:**
- ✅ GitHub에 Push만 하면 자동 배포
- ✅ Backend, Frontend, **PostgreSQL** 동시 배포
- ✅ 환경변수 자동 주입
- ✅ **데이터 영구 보존**
- ✅ 무료 플랜으로 시작 가능

### 다른 플랫폼에 배포하기

#### Vercel (Frontend만)
```bash
cd frontend
npm install -g vercel
vercel --prod
```

#### Railway (Backend + Frontend)
```bash
# Railway CLI 설치
npm install -g @railway/cli

# 프로젝트 연결
railway login
railway init
railway up
```

#### Docker로 배포
```dockerfile
# Backend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm install
COPY backend/ ./
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## ☁️ Google Cloud 마이그레이션 🚀 NEW

Render에서 Google Cloud로 마이그레이션하여 **비용을 50% 절감**하고 성능을 향상시키세요!

### 💰 비용 비교 (월 기준, 100명 미만 트래픽)

| 항목 | Render | Google Cloud | 절감 |
|------|--------|--------------|------|
| **Frontend** | $7 | **$0** (무료 티어) | -$7 |
| **Backend** | $7 | **$0-2** (무료 티어) | -$5~7 |
| **Database** | $7 | $7-10 | $0~-3 |
| **총 비용** | **$21/월** | **$7-12/월** | **$9-14 절감** |

### 🎯 Google Cloud Hybrid 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                   Google Cloud Platform                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────┐    ┌──────────────────┐              │
│  │  Cloud Storage   │    │    Cloud Run     │              │
│  │  + Cloud CDN     │◄───┤   (Backend API)  │              │
│  │   (Frontend)     │    │  Auto-scaling    │              │
│  └──────────────────┘    └────────┬─────────┘              │
│       💰 $0/월                     │ 💰 $0-2/월              │
│                                    ▼                         │
│                           ┌──────────────────┐              │
│                           │   Cloud SQL      │              │
│                           │  (PostgreSQL)    │              │
│                           │  db-f1-micro     │              │
│                           └──────────────────┘              │
│                                💰 $7-10/월                   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### 📚 마이그레이션 가이드

완전한 단계별 가이드는 다음 문서를 참고하세요:

- **[🌐 웹 콘솔 가이드](GOOGLE_CLOUD_WEB_GUIDE.md)** ⭐ **CLI 없이 배포** (초보자 추천!)
- **[📖 전체 마이그레이션 가이드](GOOGLE_CLOUD_MIGRATION.md)** - 상세 단계별 안내
- **[⚡ 빠른 시작 가이드](GOOGLE_CLOUD_QUICKSTART.md)** - 5분 만에 배포 (CLI)

### ⚡ 5분 빠른 배포 (요약)

```bash
# 1. gcloud 초기화
gcloud auth login
gcloud config set project YOUR_PROJECT_ID

# 2. Cloud SQL 생성
gcloud sql instances create hrm-postgres \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=asia-northeast3

# 3. Backend 배포 (Cloud Run)
cd backend
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/hrm-backend
gcloud run deploy hrm-backend \
  --image gcr.io/YOUR_PROJECT_ID/hrm-backend \
  --region asia-northeast3 \
  --allow-unauthenticated

# 4. Frontend 배포 (Cloud Storage)
cd ../frontend
npm run build
gsutil -m rsync -r -d dist/ gs://YOUR_BUCKET_NAME
```

### 🎁 무료 티어 혜택

- ✅ Cloud Run: 월 **200만 요청 무료**
- ✅ Cloud Storage: **5GB 무료**
- ✅ Cloud CDN: **1TB 전송 무료**
- ✅ Cloud Build: 월 **120분 빌드 무료**
- ✅ Container Registry: **5GB 스토리지 무료**

### 🔧 자동 배포 스크립트

프로젝트에 포함된 배포 스크립트를 사용하세요:

```bash
# 환경 변수 설정
export GCP_PROJECT_ID=your-project-id
export GCS_BUCKET_NAME=hrm-frontend-bucket

# 한 번에 배포
./scripts/deploy-gcp.sh
```

### 📊 성능 비교

| 지표 | Render | Google Cloud |
|------|--------|--------------|
| **Cold Start** | ~10-15초 | ~3-5초 |
| **응답 속도** | 100-200ms | 50-100ms (CDN) |
| **업타임** | 99.5% | 99.95% |
| **Auto-scaling** | 제한적 | 완전 자동 |

### 🎯 마이그레이션 장점

1. **비용 절감**: 약 50% 절감 ($21 → $7-12/월)
2. **성능 향상**: CDN으로 빠른 로딩
3. **확장성**: Auto-scaling 자동 지원
4. **무료 티어**: 대부분의 서비스 무료 사용
5. **관리 편의성**: 직접 관리 가능

### 🚀 시작하기

**추천 순서 (초보자):**
1. **[웹 콘솔 가이드](GOOGLE_CLOUD_WEB_GUIDE.md)** 읽기 ⭐ (CLI 없이 클릭만으로!)
2. Google Cloud 계정 생성 (신규 $300 크레딧)
3. 웹 브라우저에서 모든 작업 완료!

**CLI 사용 (고급):**
1. [Google Cloud 마이그레이션 가이드](GOOGLE_CLOUD_MIGRATION.md) 읽기
2. `gcloud` CLI 설치
3. [빠른 시작 가이드](GOOGLE_CLOUD_QUICKSTART.md) 따라하기

---

### 중요 사항

⚠️ **필수 설정:**
1. **HTTPS 필수**: Web NFC API는 HTTPS 환경에서만 작동
2. **CORS 설정**: Backend에서 Frontend URL 허용 필요
3. **환경변수**: `VITE_API_URL`과 `FRONTEND_URL` 반드시 설정
4. **DB 백업**: SQLite 파일 정기 백업 권장

### 배포 후 체크리스트

- [ ] **PostgreSQL 데이터베이스 생성 확인**
- [ ] Backend Health Check 확인 (`/api/health`)
- [ ] Frontend 접속 확인
- [ ] CORS 오류 없이 API 호출 가능한지 확인
- [ ] **자동 생성된 테스트 데이터 확인** (직원 3명)
- [ ] 직원 등록 및 조회 테스트
- [ ] **서버 재시작 후 데이터 유지 확인** ✅
- [ ] **Sleep Mode 방지 설정** (UptimeRobot 또는 GitHub Actions) ⚡
- [ ] (선택) Android 태블릿에서 NFC 테스트

## 🔒 보안 고려사항

1. **HTTPS 필수**: Web NFC API는 HTTPS 환경에서만 작동
2. **NFC ID 보안**: 카드 분실 시 즉시 시스템에서 삭제
3. **인증/권한**: 프로덕션에서는 관리자 인증 기능 추가 권장
4. **데이터 백업**: 
   - **Render**: PostgreSQL 자동 백업 제공 (일일 백업)
   - **로컬**: `pg_dump` 명령어로 정기 백업
   - 예시: `pg_dump -U postgres hrm_db > backup_$(date +%Y%m%d).sql`
5. **CORS 설정**: Backend에서 허용할 도메인 제한
6. **입력 검증**: 모든 사용자 입력에 대한 검증 필수
7. **환경변수 보안**: `.env` 파일은 절대 Git에 커밋하지 말 것
8. **DATABASE_URL 보호**: 프로덕션 DB 연결 문자열 노출 금지

## 🐛 문제 해결

### 서버 Sleep Mode 문제 (Render 무료 티어)

**문제**: 15분 동안 트래픽이 없으면 서버가 자동으로 슬립 모드로 전환되어, 다음 요청 시 30초~1분 정도 지연 발생

**💰 비용 걱정?** 전혀 문제 없습니다!
- Health Check 월간 사용량: **~13 MB**
- Render 무료 한도: **100 GB**
- 사용률: **0.013%** (여유 충분!) ✅

**해결 방법 1: 외부 Ping 서비스 사용 (추천 ⭐)**

1. **UptimeRobot** (무료, 5분 간격 체크)
   - [UptimeRobot](https://uptimerobot.com/) 가입
   - "Add New Monitor" 클릭
   - Monitor Type: `HTTP(s)`
   - URL: `https://hrm-backend-1dk5.onrender.com/api/health`
   - Monitoring Interval: `5 minutes` (무료 플랜)
   - ✅ 5분마다 자동으로 서버를 깨워줍니다!

2. **Cron-job.org** (무료, 1분 간격 가능)
   - [Cron-job.org](https://cron-job.org/) 가입
   - "Create cronjob" 클릭
   - URL: `https://hrm-backend-1dk5.onrender.com/api/health`
   - Execution schedule: `Every 5 minutes`
   - ✅ 더 짧은 간격으로 체크 가능!

**해결 방법 2: GitHub Actions (무료)**

프로젝트에 `.github/workflows/keep-alive.yml` 생성:

```yaml
name: Keep Render Alive

on:
  schedule:
    # 5분마다 실행 (UTC 기준)
    - cron: '*/5 * * * *'
  workflow_dispatch: # 수동 실행 가능

jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - name: Ping Backend
        run: |
          curl -f https://hrm-backend-1dk5.onrender.com/api/health || exit 0
          echo "Backend is alive!"
```

**해결 방법 3: Frontend에서 주기적 Health Check**

`frontend/src/App.tsx`에 추가:

```typescript
// App 컴포넌트 내부
useEffect(() => {
  // 5분마다 Health Check
  const keepAlive = setInterval(async () => {
    try {
      await fetch(`${API_BASE_URL}/health`);
      console.log('Backend keepalive ping sent');
    } catch (error) {
      console.warn('Backend keepalive failed:', error);
    }
  }, 5 * 60 * 1000); // 5분

  return () => clearInterval(keepAlive);
}, []);
```

> ⚠️ **주의사항**:
> - Frontend 방식은 사용자가 브라우저를 열어둬야만 작동
> - **UptimeRobot 또는 GitHub Actions 사용을 강력히 권장**

**비교표:**

| 방법 | 비용 | 설정 난이도 | 신뢰도 | 최소 간격 |
|------|------|------------|--------|----------|
| **UptimeRobot** | 무료 | ⭐ 쉬움 | ⭐⭐⭐⭐⭐ | 5분 |
| **Cron-job.org** | 무료 | ⭐ 쉬움 | ⭐⭐⭐⭐⭐ | 1분 |
| **GitHub Actions** | 무료 | ⭐⭐ 보통 | ⭐⭐⭐⭐ | 5분 |
| **Frontend Ping** | 무료 | ⭐⭐⭐ 복잡 | ⭐⭐ 낮음 | 제한 없음 |

### 💰 대역폭 사용량 모니터링

**월간 예상 대역폭 (직원 100명 기준):**
```
Health Check (5분 간격):    13 MB
실제 사용자 트래픽:       ~200 MB
─────────────────────────────────
총 예상:                 ~213 MB / 100 GB (0.2%)
```

**Render 대시보드 확인:**
1. [Render Dashboard](https://dashboard.render.com) 접속
2. 서비스 선택 → "Metrics" 탭
3. "Bandwidth Used" 확인
4. ✅ 보통 1GB도 사용 안 함

**안전장치:**
- 100GB 초과 시: 자동 과금 ❌ (서비스 일시 중지만)
- 초과 전: 이메일 경고 알림 ✅
- 매월 1일: 자동 리셋 ✅

---

### NFC가 작동하지 않는 경우

**문제**: "NFC를 지원하지 않는 기기입니다" 메시지가 표시됨

**해결 방법:**
1. ✅ Android 기기인지 확인 (iOS는 지원 안 함)
2. ✅ 기기 설정에서 NFC 활성화 확인
3. ✅ Chrome 또는 Edge 브라우저 사용 확인
4. ✅ HTTPS 연결 확인 (로컬에서는 localhost도 가능)
5. ✅ 브라우저 버전이 최신인지 확인

**추가 디버깅:**
```javascript
// 브라우저 콘솔에서 실행
if ('NDEFReader' in window) {
  console.log('Web NFC 지원됨');
} else {
  console.log('Web NFC 지원 안 됨');
}
```

### 데이터베이스 초기화

**문제**: 데이터베이스가 손상되었거나 초기화가 필요함

**해결 방법 (로컬 개발):**
```bash
# Backend 디렉토리에서
cd backend

# PostgreSQL 데이터베이스 재생성
docker exec -it hrm-postgres psql -U postgres -c "DROP DATABASE IF EXISTS hrm_db;"
docker exec -it hrm-postgres psql -U postgres -c "CREATE DATABASE hrm_db;"

# 서버 재시작 (테이블 자동 생성)
npm run dev

# 테스트 데이터 추가
npm run seed -- --force
```

**프로덕션 환경 (Render):**
- Render 대시보드 → Database → "Reset Database"
- 또는 Seed API 사용: `POST /api/seed`

### 포트 충돌

**문제**: "Port 3000 is already in use" 오류

**해결 방법:**
```bash
# Windows에서 포트 사용 중인 프로세스 종료
netstat -ano | findstr :3000
taskkill /PID [프로세스ID] /F

# 또는 .env 파일에서 포트 변경
PORT=3001
```

### CORS 오류

**문제**: Frontend에서 Backend API 호출 시 CORS 오류 발생

**해결 방법:**

`backend/src/index.ts`에서 CORS 설정 확인:
```typescript
app.use(cors({
  origin: ['http://localhost:5173', 'https://your-frontend-domain.com'],
  credentials: true
}));
```

### Excel 다운로드 안 됨

**문제**: Excel 내보내기 버튼 클릭 시 다운로드되지 않음

**해결 방법:**
1. 브라우저 팝업 차단 해제 확인
2. 브라우저 콘솔에서 오류 메시지 확인
3. Backend 서버가 정상 실행 중인지 확인
4. 네트워크 탭에서 API 응답 확인

## 👨‍💻 개발 환경 및 도구

### 필수 요구사항
- **Node.js**: v18.x 이상
- **npm**: v9.x 이상
- **Git**: 버전 관리
- **VSCode**: 추천 IDE

### 추천 VSCode 확장
- ESLint
- Prettier
- TypeScript Vue Plugin (Volar)
- Tailwind CSS IntelliSense
- SQLite Viewer

### 개발 모드에서 사용 가능한 스크립트

**PostgreSQL 로컬 설정 (최초 1회):**
```bash
# Docker로 PostgreSQL 시작
docker run --name hrm-postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres

# 데이터베이스 생성
docker exec -it hrm-postgres psql -U postgres -c "CREATE DATABASE hrm_db;"
```

**개발 스크립트:**
```bash
# 루트 디렉토리
npm run dev              # Backend + Frontend 동시 실행
npm run dev:backend      # Backend만 실행
npm run dev:frontend     # Frontend만 실행
npm run install:all      # 모든 의존성 설치
npm run build            # Backend + Frontend 빌드

# Backend 디렉토리
npm run dev              # 개발 서버 (nodemon)
npm run build            # TypeScript 컴파일
npm start                # 프로덕션 서버
npm run seed             # 테스트 데이터 생성 (PostgreSQL)

# Frontend 디렉토리
npm run dev              # 개발 서버 (Vite)
npm run build            # 프로덕션 빌드
npm run preview          # 프로덕션 프리뷰
npm run lint             # ESLint 검사
```

### 환경변수 참고

**Backend (`backend/.env`)**
```env
PORT=3000                                              # 서버 포트
NODE_ENV=development                                   # 환경 (development/production)
DATABASE_URL=postgres://postgres:password@localhost:5432/hrm_db  # PostgreSQL 연결
FRONTEND_URL=http://localhost:5173                    # Frontend URL (CORS)
```

**프로덕션 (Render):**
```env
PORT=3000
NODE_ENV=production
DATABASE_URL=<자동 주입>  # render.yaml에서 자동 설정
FRONTEND_URL=https://hrm-frontend-3tph.onrender.com
```

**Frontend (Vite 환경변수)**
```env
VITE_API_URL=http://localhost:3000/api               # 로컬 개발
VITE_API_URL=https://hrm-backend-1dk5.onrender.com/api  # 프로덕션
```

### Git 브랜치 전략
- `main`: 프로덕션 배포 브랜치
- `develop`: 개발 통합 브랜치
- `feat/*`: 새 기능 개발
- `fix/*`: 버그 수정
- `docs/*`: 문서 업데이트

### 커밋 메시지 규칙
```
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 수정
style: 코드 포맷팅, 세미콜론 누락 등
refactor: 코드 리팩토링
test: 테스트 코드 추가
chore: 빌드 업무 수정, 패키지 매니저 수정
```

자세한 내용은 [CONTRIBUTING.md](CONTRIBUTING.md)를 참고하세요.

## 📚 추가 리소스

### 공식 문서
- [Web NFC API 문서](https://developer.mozilla.org/en-US/docs/Web/API/Web_NFC_API)
- [React 공식 문서](https://react.dev/)
- [Express.js 문서](https://expressjs.com/)
- [PostgreSQL 문서](https://www.postgresql.org/docs/)
- [node-postgres (pg) 문서](https://node-postgres.com/)
- [Vite 문서](https://vitejs.dev/)
- [Render 배포 가이드](https://render.com/docs)
- [Render PostgreSQL 가이드](https://render.com/docs/databases)

### 프로젝트 문서
- [빠른 시작 가이드](QUICKSTART.md)
- [기여 가이드](CONTRIBUTING.md)
- [커밋 메시지 가이드](docs/COMMIT_MESSAGES.md)
- [개발자 문서](docs/README.md)
- **[NFC 통합 가이드](docs/NFC_INTEGRATION_GUIDE.md)** ⭐ NFC 담당 개발자용
- **[테스트 시나리오](docs/TEST_SCENARIOS.md)** 🧪 QA 테스트 가이드

## 📄 라이선스

이 프로젝트는 MIT 라이선스로 배포됩니다.

## 🤝 기여

이슈 및 풀 리퀘스트를 환영합니다!

프로젝트에 기여하기 전에 **[기여 가이드](CONTRIBUTING.md)**를 읽어주세요.

### 간단한 기여 방법
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feat/amazing-feature`)
3. Commit your Changes (`git commit -m 'feat: 놀라운 기능 추가'`)
4. Push to the Branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request

### 📖 문서
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - 코드 컨벤션 및 Git 규칙
- **[QUICKSTART.md](QUICKSTART.md)** - 빠른 시작 가이드
- **[docs/README.md](docs/README.md)** - 개발자 문서

## 📞 문의

문제가 발생하거나 질문이 있으시면 이슈를 등록해주세요.

---

**만든 사람**: HRM 개발팀  
**최종 업데이트**: 2026-01-06  
**버전**: 1.0.0  
**라이선스**: MIT  

### 🔗 주요 링크
- **GitHub**: https://github.com/hanomon/HRM
- **Live Demo**: https://hrm-frontend-3tph.onrender.com
- **API Docs**: https://hrm-backend-1dk5.onrender.com/api/health
