# 🚂 Railway로 한번에 배포하기

Backend와 Frontend를 하나의 프로젝트에서 관리하며 배포합니다.

## ⚡ 빠른 시작 (5분)

### 1️⃣ Railway 회원가입

1. **https://railway.app** 접속
2. **"Login"** 클릭
3. **"Login with GitHub"** 선택
4. GitHub 권한 승인

### 2️⃣ 새 프로젝트 만들기

1. **"New Project"** 클릭
2. **"Deploy from GitHub repo"** 선택
3. **"Configure GitHub App"** 클릭하여 저장소 접근 권한 부여
4. **"hanomon/HRM"** 저장소 선택

### 3️⃣ Backend 서비스 설정

Railway가 자동으로 감지하지만, 수동으로 설정:

**Settings 탭에서:**

```
Root Directory: backend
Build Command: npm install && npm run build
Start Command: npm start
Watch Paths: backend/**
```

**Variables 탭에서 환경변수 추가:**

```
NODE_ENV = production
DATABASE_PATH = ./attendance.db
```

**Deploy 클릭!** 🚀

Backend가 배포되면 **URL이 생성됨**:
```
https://hrm-backend-production.up.railway.app
```

### 4️⃣ Frontend 서비스 추가

1. 프로젝트 대시보드에서 **"+ New"** 클릭
2. **"GitHub Repo"** 선택
3. 같은 **"hanomon/HRM"** 저장소 선택
4. **"Add variables"** 클릭

**Settings 탭에서:**

```
Root Directory: frontend
Build Command: npm run build
Start Command: npm run preview (또는 Vite serve)
Watch Paths: frontend/**
```

**Variables 탭에서 환경변수 추가:**

```
VITE_API_URL = https://hrm-backend-production.up.railway.app/api
```
⚠️ **Backend URL을 여기에 입력!**

**Deploy 클릭!** 🚀

### 5️⃣ 완료!

이제 두 서비스가 실행됩니다:

- **Backend**: `https://hrm-backend-production.up.railway.app`
- **Frontend**: `https://hrm-frontend-production.up.railway.app`

---

## 🔄 자동 배포

이제 GitHub에 푸시하면 자동으로 배포됩니다!

```bash
git add .
git commit -m "feat: add new feature"
git push origin main
```

Railway가 자동으로:
1. 변경사항 감지
2. Backend와 Frontend 자동 빌드
3. 자동 배포

---

## 🌱 테스트 데이터 추가

### Backend Shell 접속

1. Railway 대시보드 → Backend 서비스 클릭
2. **"Shell"** 탭 클릭
3. 다음 명령어 실행:

```bash
npm run seed -- --force
```

---

## 💰 비용

Railway 무료 플랜:
- **$5 무료 크레딧/월**
- Backend + Frontend 실행 가능
- 예상 사용량: $3-4/월 (무료 범위 내)
- 슬립 모드 없음 (항상 켜져 있음)

---

## ⚙️ 고급 설정

### Custom Domain

**Settings → Networking → Custom Domain**

```
Backend: api.yourdomain.com
Frontend: yourdomain.com
```

### 데이터 영속성

**Add Volume:**

1. Backend 서비스 → **"Settings"**
2. **"Volumes"** 섹션 찾기
3. **"+ Add Volume"** 클릭
4. Mount Path: `/app/data`
5. DATABASE_PATH 환경변수를 `/app/data/attendance.db`로 변경

---

## 🐛 문제 해결

### 빌드 실패

**Logs 탭에서 에러 확인:**

```bash
# 로컬에서 테스트
cd backend && npm run build
cd ../frontend && npm run build
```

### Frontend에서 API 연결 안 됨

1. Frontend 환경변수에서 `VITE_API_URL` 확인
2. Backend URL이 올바른지 확인
3. `/api` 경로가 포함되어 있는지 확인

### CORS 오류

Backend의 `src/index.ts`에서 Frontend URL 추가:

```typescript
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://hrm-frontend-production.up.railway.app'
  ],
  credentials: true
}));
```

---

## 📊 모니터링

Railway 대시보드에서:

- **Metrics**: CPU, 메모리, 네트워크 사용량
- **Logs**: 실시간 로그 확인
- **Deployments**: 배포 히스토리

---

## 🎉 완료!

축하합니다! 이제 Backend와 Frontend가 모두 배포되었습니다!

**다음 단계:**
1. Frontend URL로 접속
2. 기능 테스트
3. 팀원들에게 URL 공유
4. Android 태블릿에서 NFC 테스트

---

**배포 시간**: 약 5-10분  
**비용**: 무료 ($5 크레딧 내)  
**난이도**: ⭐⭐☆☆☆  
**추천도**: ⭐⭐⭐⭐⭐

