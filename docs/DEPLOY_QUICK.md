# ⚡ 5분 빠른 배포 가이드

가장 빠르고 쉬운 방법으로 HRM 시스템을 배포합니다.

## 🎯 배포 순서

1. **Backend 먼저** → Render
2. **Frontend 나중에** → Vercel

---

## 1️⃣ Backend 배포 (Render) - 2분

### 준비물
- GitHub 계정
- 이 저장소가 GitHub에 푸시되어 있어야 함

### 단계별 가이드

**1. Render 가입** (30초)
- https://render.com 접속
- **"Get Started for Free"** 클릭
- GitHub로 로그인

**2. 새 Web Service 생성** (30초)
- **"New +" → "Web Service"** 클릭
- **"Build and deploy from a Git repository"** 선택
- **"Next"** 클릭
- GitHub에서 **"hanomon/HRM"** 저장소 선택
- **"Connect"** 클릭

**3. 설정 입력** (1분)
```
Name: hrm-backend
Region: Singapore
Branch: main
Root Directory: backend
Runtime: Node
Build Command: npm install && npm run build
Start Command: npm start
Instance Type: Free
```

**4. 환경변수 추가**
"Environment" 섹션에서 **"Add Environment Variable"** 클릭:
```
NODE_ENV = production
DATABASE_PATH = ./attendance.db
```

**5. 배포!**
- **"Create Web Service"** 클릭
- 3-5분 기다리기 ☕
- 완료되면 URL이 표시됨: `https://hrm-backend-xxxx.onrender.com`
- **이 URL을 복사해두세요!** 📋

---

## 2️⃣ Frontend 배포 (Vercel) - 3분

### 단계별 가이드

**1. Vercel 가입** (30초)
- https://vercel.com 접속
- **"Sign Up"** 클릭
- GitHub로 로그인

**2. 프로젝트 Import** (30초)
- **"Add New..." → "Project"** 클릭
- GitHub 저장소에서 **"hanomon/HRM"** 선택
- **"Import"** 클릭

**3. 프로젝트 설정** (1분)
```
Framework Preset: Vite (자동 감지됨)
Root Directory: frontend
Build Command: npm run build (자동)
Output Directory: dist (자동)
Install Command: npm install (자동)
```

**4. 환경변수 설정** ⚠️ **중요!**
"Environment Variables" 섹션에서:
```
Name: VITE_API_URL
Value: https://hrm-backend-xxxx.onrender.com/api
```
☝️ 여기에 1단계에서 복사한 Backend URL을 붙여넣고 끝에 `/api` 추가!

**5. 배포!**
- **"Deploy"** 클릭
- 2-3분 기다리기 ☕
- 완료!

**6. 사이트 접속**
- URL: `https://hrm-xxxxx.vercel.app`
- 브라우저에서 열기
- 짝짝짝! 🎉

---

## ✅ 배포 확인

### Backend 확인
```bash
curl https://hrm-backend-xxxx.onrender.com/api/health

# 응답이 나와야 함:
{"status":"ok","message":"서버가 정상 작동중입니다."}
```

### Frontend 확인
1. Vercel URL 접속
2. 직원 관리 페이지 확인
3. 데이터가 비어있으면 정상!

---

## 🌱 테스트 데이터 추가

Backend 대시보드에서:

### Render Console 사용
1. Render 대시보드 → 서비스 선택
2. **"Shell"** 탭 클릭
3. 다음 명령어 실행:
```bash
npm run seed -- --force
```
4. 3명의 직원과 45건의 출퇴근 기록 생성됨!
5. Frontend 새로고침 → 데이터 확인

---

## 🎉 완료!

축하합니다! 이제 다음이 준비되었습니다:

✅ **Backend**: `https://hrm-backend-xxxx.onrender.com`
✅ **Frontend**: `https://hrm-xxxxx.vercel.app`

### 다음 단계:
1. 팀원들에게 URL 공유
2. Android 태블릿에서 Frontend URL 접속
3. NFC 태깅 테스트
4. 실제 직원 데이터 입력

---

## 🔄 자동 배포

이제부터 `git push`하면 자동으로 재배포됩니다!

```bash
git add .
git commit -m "feat: 새 기능 추가"
git push origin main
```

- Vercel: 자동으로 Frontend 재배포
- Render: 자동으로 Backend 재배포

---

## ⚠️ 중요 참고사항

### Render 무료 플랜
- 15분 비활성 시 슬립 모드
- 첫 요청 시 재시작 (15-30초 소요)
- 해결: 유료 플랜 ($7/월) 또는 Railway 사용

### 데이터 백업
- Render 무료 플랜은 디스크가 휘발성
- 정기적으로 Excel 내보내기로 백업 권장
- 또는 PostgreSQL로 마이그레이션

---

## 🆘 문제 해결

### "API 연결 안 됨"
1. Backend URL이 올바른지 확인
2. `/api`가 URL 끝에 있는지 확인
3. Vercel 환경변수에서 `VITE_API_URL` 확인
4. Vercel 재배포: **"Deployments"** → 최신 배포 → **"Redeploy"**

### "빌드 실패"
1. 로컬에서 테스트:
```bash
cd backend && npm run build
cd ../frontend && npm run build
```
2. 에러 확인 후 수정
3. 다시 푸시

### "데이터가 없어요"
Render Shell에서:
```bash
npm run seed -- --force
```

---

## 📞 더 자세한 정보

전체 배포 가이드: [DEPLOYMENT.md](../DEPLOYMENT.md)

---

**배포 소요 시간**: 약 5분  
**비용**: 완전 무료 🎉  
**난이도**: ⭐⭐☆☆☆

