# 🎯 한번에 배포하기 - 완전 가이드

Backend와 Frontend를 **한 곳에서 관리**하며 배포하는 방법입니다.

## 📌 배포 옵션 비교

| 플랫폼 | 난이도 | 비용 | 통합도 | 추천도 |
|--------|--------|------|--------|--------|
| **Railway** | ⭐⭐☆☆☆ | $5 크레딧/월 | ⭐⭐⭐⭐⭐ | ✅ **최고** |
| Render | ⭐⭐⭐☆☆ | 무료 | ⭐⭐⭐☆☆ | ✅ 좋음 |
| Vercel + Render | ⭐⭐☆☆☆ | 무료 | ⭐⭐☆☆☆ | ✅ 좋음 |

---

## 🚂 방법 1: Railway (가장 쉬움!)

### 장점
- ✅ 한 프로젝트에 여러 서비스
- ✅ GitHub 자동 배포
- ✅ 슬립 모드 없음
- ✅ 영구 스토리지 지원
- ✅ 직관적인 UI

### 단계

**1. Railway 가입**
```
https://railway.app → Login with GitHub
```

**2. New Project**
```
New Project → Deploy from GitHub repo → hanomon/HRM 선택
```

**3. Backend 설정**
```
Root Directory: backend
Build: npm install && npm run build
Start: npm start
Env: 
  NODE_ENV=production
  DATABASE_PATH=./attendance.db
```

**4. Frontend 추가**
```
+ New → GitHub Repo → 같은 저장소
Root Directory: frontend
Build: npm run build
Start: npm run preview
Env:
  VITE_API_URL=<Backend URL>/api
```

**5. 완료!** 🎉

자세한 가이드: [DEPLOY_RAILWAY.md](DEPLOY_RAILWAY.md)

---

## 🎨 방법 2: Render Blueprint

### 장점
- ✅ YAML 파일로 인프라 관리
- ✅ 완전 무료
- ✅ 버전 관리 가능

### Render Blueprint 업데이트

우리가 이미 준비한 `render.yaml`을 확장:

```yaml
services:
  # Backend
  - type: web
    name: hrm-backend
    runtime: node
    buildCommand: cd backend && npm install && npm run build
    startCommand: cd backend && npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_PATH
        value: ./attendance.db
  
  # Frontend
  - type: web
    name: hrm-frontend
    runtime: node
    buildCommand: cd frontend && npm install && npm run build
    startCommand: cd frontend && npm run preview
    envVars:
      - key: VITE_API_URL
        sync: false  # Set manually
```

### 배포

1. **https://render.com** 가입
2. **New → Blueprint** 선택
3. **hanomon/HRM** 저장소 연결
4. `render.yaml` 자동 감지
5. **Apply** 클릭
6. Frontend 환경변수에 Backend URL 입력
7. 완료!

---

## 🌐 방법 3: Vercel (Frontend) + Render (Backend)

### 장점
- ✅ 각각 최적화된 플랫폼 사용
- ✅ 완전 무료
- ✅ Vercel의 빠른 CDN

### 단계

**Backend (Render):**
```
https://render.com
New → Web Service → hanomon/HRM
Root: backend
Build: npm install && npm run build
Start: npm start
```

**Frontend (Vercel):**
```
https://vercel.com
Add New → Project → hanomon/HRM
Root: frontend
Framework: Vite (자동 감지)
Env: VITE_API_URL=<Render Backend URL>/api
```

---

## 🔄 자동 배포 설정

모든 방법에서 Git Push 시 자동 배포!

```bash
# 코드 수정
git add .
git commit -m "feat: add new feature"
git push origin main

# Railway/Render/Vercel이 자동으로:
# 1. 변경사항 감지
# 2. 빌드
# 3. 배포
```

---

## 📊 배포 후 확인

### Backend 테스트

```bash
# Health Check
curl https://your-backend-url/api/health

# Expected:
{"status":"ok","message":"서버가 정상 작동중입니다."}

# Employee API
curl https://your-backend-url/api/employees

# Expected:
[]  # 또는 직원 목록
```

### Frontend 테스트

1. Frontend URL 접속
2. 페이지 로드 확인
3. 직원 관리 페이지 확인
4. API 연결 확인 (데이터 로드)

---

## 🌱 초기 데이터 추가

### Railway
```bash
# Shell 탭에서
npm run seed -- --force
```

### Render
```bash
# Shell에서
cd backend
npm run seed -- --force
```

---

## 🔐 환경변수 관리

### 중요한 환경변수

**Backend:**
```
NODE_ENV=production
DATABASE_PATH=./attendance.db
FRONTEND_URL=https://your-frontend-url.com
```

**Frontend:**
```
VITE_API_URL=https://your-backend-url.com/api
```

### 보안 팁
- ❌ `.env` 파일은 Git에 커밋하지 않기
- ✅ 플랫폼 대시보드에서 환경변수 관리
- ✅ 민감한 정보는 환경변수로만 관리

---

## 💰 비용 계산

### Railway (추천)
```
무료 크레딧: $5/월
예상 사용: $3-4/월
→ 무료 범위 내!
```

### Render
```
Backend Free: 무료 (슬립 모드)
Frontend Free: 무료 (슬립 모드)
→ 완전 무료!
```

### Vercel + Render
```
Vercel: 무료
Render: 무료
→ 완전 무료!
```

---

## 🚨 일반적인 문제

### 문제 1: API 연결 안 됨

**증상**: Frontend에서 데이터 로드 실패

**해결:**
1. Backend URL 확인
2. `/api` 경로 확인
3. CORS 설정 확인
4. HTTPS 사용 확인

### 문제 2: 빌드 실패

**해결:**
```bash
# 로컬에서 테스트
npm run build
```

### 문제 3: 데이터베이스 초기화

**해결:**
```bash
# Backend Shell에서
npm run seed -- --force
```

---

## 📚 추가 리소스

- [Railway 배포 가이드](DEPLOY_RAILWAY.md)
- [5분 빠른 배포](DEPLOY_QUICK.md)
- [전체 배포 가이드](../DEPLOYMENT.md)

---

## 🎉 배포 완료!

축하합니다! 이제 전 세계 어디서나 HRM 시스템에 접속할 수 있습니다!

**다음 단계:**
1. 팀원들에게 URL 공유
2. Android 태블릿에서 테스트
3. 실제 직원 데이터 입력
4. 피드백 수집

---

**가장 추천**: Railway로 배포하기
- 가장 쉬움
- 한 곳에서 관리
- 무료 범위 내 사용 가능

