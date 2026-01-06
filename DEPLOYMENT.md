# 🚀 배포 가이드

이 문서는 HRM 시스템을 프로덕션 환경에 배포하는 방법을 설명합니다.

## 📋 목차
- [빠른 배포 (추천)](#-빠른-배포-추천)
- [Frontend 배포](#-frontend-배포)
- [Backend 배포](#-backend-배포)
- [환경변수 설정](#-환경변수-설정)
- [배포 후 체크리스트](#-배포-후-체크리스트)

---

## ⚡ 빠른 배포 (추천)

가장 간단하고 무료로 배포할 수 있는 방법입니다.

### 추천 조합
- **Frontend**: Vercel (무료, 자동 배포)
- **Backend**: Render 또는 Railway (무료 플랜)

---

## 🎨 Frontend 배포

### 방법 1: Vercel (추천) ⭐

**장점:**
- ✅ 완전 무료
- ✅ GitHub 연동으로 자동 배포
- ✅ HTTPS 자동 설정
- ✅ 글로벌 CDN
- ✅ 커밋할 때마다 자동 배포

#### 1단계: Vercel 계정 생성
1. https://vercel.com 접속
2. **"Sign Up"** 클릭
3. **GitHub 계정으로 로그인**

#### 2단계: 프로젝트 Import
1. Vercel 대시보드에서 **"Add New..." → "Project"** 클릭
2. GitHub 저장소에서 **"hanomon/HRM"** 선택
3. **"Import"** 클릭

#### 3단계: 프로젝트 설정
```
Framework Preset: Vite
Root Directory: frontend
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

#### 4단계: 환경변수 설정
Environment Variables에 추가:
```
VITE_API_URL = https://your-backend-url.com/api
```
(Backend 배포 후 URL 업데이트 필요)

#### 5단계: Deploy
**"Deploy"** 버튼 클릭!

배포 완료 후:
- URL: `https://hrm-xxxxx.vercel.app`
- 이후 `main` 브랜치에 푸시하면 자동 재배포됨

---

### 방법 2: Netlify

#### 1단계: Netlify 계정 생성
1. https://netlify.com 접속
2. GitHub로 로그인

#### 2단계: 새 사이트 추가
1. **"Add new site" → "Import an existing project"**
2. GitHub에서 HRM 저장소 선택

#### 3단계: 빌드 설정
```
Base directory: frontend
Build command: npm run build
Publish directory: frontend/dist
```

#### 4단계: 환경변수
```
VITE_API_URL = https://your-backend-url.com/api
```

#### 5단계: Deploy
**"Deploy site"** 클릭!

---

## 🔧 Backend 배포

### 방법 1: Render (추천) ⭐

**장점:**
- ✅ 무료 플랜 (750시간/월)
- ✅ GitHub 자동 배포
- ✅ SQLite 지원
- ✅ HTTPS 자동

#### 1단계: Render 계정 생성
1. https://render.com 접속
2. GitHub로 로그인

#### 2단계: 새 Web Service 생성
1. **"New +" → "Web Service"** 클릭
2. GitHub에서 **HRM 저장소** 선택

#### 3단계: 설정
```
Name: hrm-backend
Region: Singapore (또는 가까운 지역)
Branch: main
Root Directory: backend
Runtime: Node
Build Command: npm install && npm run build
Start Command: npm start
```

#### 4단계: 환경변수
Environment Variables 섹션에 추가:
```
NODE_ENV=production
PORT=3000
DATABASE_PATH=./attendance.db
```

#### 5단계: 인스턴스 타입
```
Instance Type: Free (무료)
```

#### 6단계: Deploy
**"Create Web Service"** 클릭!

배포 완료 후:
- URL: `https://hrm-backend.onrender.com`
- 이 URL을 Frontend 환경변수에 설정

#### ⚠️ 중요: SQLite 데이터 영속성

Render의 무료 플랜은 디스크가 휘발성입니다. 재시작 시 데이터가 사라질 수 있습니다.

**해결 방법:**
1. **Render Disk** 사용 (유료)
2. **PostgreSQL**로 마이그레이션 (추천)
3. 주기적으로 DB 백업

---

### 방법 2: Railway

#### 1단계: Railway 계정 생성
1. https://railway.app 접속
2. GitHub로 로그인

#### 2단계: 새 프로젝트
1. **"New Project"** 클릭
2. **"Deploy from GitHub repo"** 선택
3. HRM 저장소 선택

#### 3단계: 설정
```
Root Directory: backend
Build Command: npm install && npm run build
Start Command: npm start
```

#### 4단계: 환경변수
```
NODE_ENV=production
PORT=$PORT (Railway가 자동으로 제공)
DATABASE_PATH=/data/attendance.db
```

#### 5단계: Volume 추가 (데이터 영속성)
```
Mount Path: /data
```

#### 6단계: Deploy
자동으로 배포됨!

---

## 🔐 환경변수 설정

### Frontend 환경변수

`.env.production` 파일 생성 (로컬 테스트용):
```bash
VITE_API_URL=https://your-backend-url.com/api
```

Vercel/Netlify 대시보드에서:
```
VITE_API_URL = https://hrm-backend.onrender.com/api
```

### Backend 환경변수

Render/Railway 대시보드에서:
```
NODE_ENV=production
PORT=3000
DATABASE_PATH=./attendance.db
```

---

## ✅ 배포 후 체크리스트

### 1. Backend 확인
```bash
# API 테스트
curl https://your-backend-url.com/api/employees

# 정상 응답 (빈 배열 또는 직원 목록)
[]
```

### 2. Frontend 확인
- [ ] 사이트 접속 확인
- [ ] 페이지 이동 테스트
- [ ] API 연결 확인 (직원 목록 로드)

### 3. 테스트 데이터 생성
Backend 서버에서:
```bash
# SSH 또는 Console 접속 후
npm run seed -- --force
```

### 4. 기능 테스트
- [ ] 직원 추가
- [ ] 직원 목록 조회
- [ ] 출퇴근 기록 조회
- [ ] Excel 내보내기

### 5. HTTPS 확인
- [ ] Frontend HTTPS 작동
- [ ] Backend HTTPS 작동
- [ ] Mixed Content 오류 없음

### 6. CORS 확인
`backend/src/index.ts`:
```typescript
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://hrm-xxxxx.vercel.app'  // Frontend URL 추가
  ],
  credentials: true
}));
```

---

## 🔄 자동 배포 설정

### Git Push 시 자동 배포

이미 설정되어 있습니다! 🎉

```bash
git add .
git commit -m "feat: 새로운 기능 추가"
git push origin main
```

- Vercel/Netlify: Frontend 자동 재배포
- Render/Railway: Backend 자동 재배포

---

## 📊 무료 플랜 제한사항

### Vercel (Frontend)
- ✅ 무제한 배포
- ✅ 대역폭: 100GB/월
- ✅ 빌드: 6000분/월

### Render (Backend)
- ⚠️ 15분 비활성 시 슬립 모드 (재시작 느림)
- ✅ 750시간/월 (항상 켜두면 충분)
- ⚠️ 디스크 휘발성

### Railway (Backend)
- ✅ $5 무료 크레딧/월
- ✅ 영구 스토리지 지원
- ✅ 슬립 모드 없음

---

## 🆙 업그레이드 옵션

프로젝트가 성장하면:

### Frontend
- Vercel Pro ($20/월) - 더 많은 대역폭
- Cloudflare Pages (무료, 무제한)

### Backend
- Render Standard ($7/월) - 영구 디스크, 슬립 없음
- Railway Pro ($5/월부터) - 더 많은 리소스
- AWS/GCP/Azure - 완전한 제어

### Database
- PostgreSQL (Render/Railway 무료 제공)
- PlanetScale (MySQL 호환, 무료 플랜)
- Supabase (PostgreSQL, 무료 플랜)

---

## 🐛 배포 문제 해결

### 문제 1: API 연결 안 됨

**증상**: Frontend에서 데이터 로드 실패

**해결:**
1. Backend URL 확인
2. CORS 설정 확인
3. HTTPS/HTTP 혼합 확인
4. 브라우저 콘솔에서 에러 확인

### 문제 2: 빌드 실패

**Backend:**
```bash
# 로컬에서 빌드 테스트
cd backend
npm run build
npm start
```

**Frontend:**
```bash
# 로컬에서 빌드 테스트
cd frontend
npm run build
npm run preview
```

### 문제 3: 데이터베이스 초기화

Render Console 또는 Railway Shell에서:
```bash
npm run seed -- --force
```

---

## 📞 도움이 필요하신가요?

- 🐛 버그: GitHub Issues
- 💬 질문: GitHub Discussions
- 📧 문의: 프로젝트 관리자

---

## 🎉 배포 성공!

축하합니다! 이제 전 세계 어디서나 HRM 시스템을 사용할 수 있습니다!

**다음 단계:**
1. 팀원들에게 URL 공유
2. 실제 직원 데이터 입력
3. Android 태블릿에서 NFC 태깅 테스트
4. 피드백 수집 및 개선

---

**마지막 업데이트**: 2026-01-01

