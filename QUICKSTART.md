# ⚡ 빠른 시작 가이드

처음 프로젝트를 시작하는 개발자를 위한 5분 빠른 시작 가이드입니다.

## 📋 체크리스트

시작하기 전에 다음을 확인하세요:
- [ ] Node.js v18 이상 설치됨
- [ ] Git 설치됨
- [ ] 코드 에디터 (VS Code 권장)

## 🚀 5분 만에 시작하기

### 1️⃣ 프로젝트 설치 (1분)

```bash
# 프로젝트 폴더로 이동
cd HRM

# 모든 의존성 설치 (Backend + Frontend)
npm run install:all
```

### 2️⃣ 테스트 데이터 생성 (1분)

```bash
# Backend 폴더로 이동
cd backend

# 샘플 데이터 생성 (직원 3명 + 출퇴근 기록 45건)
npm run seed -- --force

# 다시 루트로 이동
cd ..
```

**생성되는 테스트 데이터:**
- 직원 3명 (김철수, 이영희, 박민수)
- 최근 7일간의 출퇴근 기록
- 총 45건의 NFC 태깅 기록

### 3️⃣ 서버 실행 (1분)

```bash
# Backend + Frontend 동시 실행
npm run dev
```

**실행 확인:**
- Backend: http://localhost:3000
- Frontend: http://localhost:5173

터미널에 다음과 같은 메시지가 표시되면 성공:
```
> Backend running on http://localhost:3000
> Frontend running on http://localhost:5173
```

### 4️⃣ 브라우저에서 확인 (2분)

브라우저를 열고 http://localhost:5173 에 접속하세요.

**확인할 사항:**
1. ✅ 대시보드에서 출퇴근 기록 확인
2. ✅ 직원 관리에서 직원 목록 확인 (3명)
3. ✅ NFC 태깅 페이지 접속 (실제 태깅은 Android만 가능)

## 🧪 기능 테스트

### 직원 추가 테스트

1. "직원 관리" 메뉴 클릭
2. "직원 추가" 버튼 클릭
3. 다음 정보 입력:
   ```
   이름: 홍길동
   NFC ID: 04:D1:E2:F3:A4:B5:C6
   부서: 영업팀
   직책: 과장
   이메일: hong@company.com
   전화번호: 010-9876-5432
   ```
4. "저장" 클릭
5. 직원 목록에서 확인

### NFC 태깅 시뮬레이션 (NFC 카드 없이 테스트)

브라우저 콘솔(F12)을 열고 다음 코드 실행:

```javascript
// 김철수 출근 태깅
fetch('http://localhost:3000/api/attendance', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ nfc_id: '04:A1:B2:C3:D4:E5:F6' })
})
.then(res => res.json())
.then(data => console.log('✅ 태깅 성공:', data));
```

대시보드를 새로고침하면 새로운 기록이 추가된 것을 확인할 수 있습니다.

### Excel 내보내기 테스트

1. 대시보드에서 날짜 범위 선택 (또는 전체)
2. "Excel 내보내기" 버튼 클릭
3. Excel 파일 다운로드 확인
4. Excel에서 파일 열어보기

## 📚 다음 단계

프로젝트가 정상적으로 실행되면:

1. **코드 구조 파악**: 
   - `backend/src/` - Backend API 코드
   - `frontend/src/` - Frontend React 코드

2. **API 문서 확인**: 
   - README.md의 "API 엔드포인트" 섹션 참조

3. **실제 NFC 태깅 테스트** (Android 기기 필요):
   - Android 태블릿에서 Chrome 브라우저로 접속
   - NFC 태깅 페이지에서 실제 카드로 테스트

4. **스크린샷 추가** (문서화):
   - `docs/SCREENSHOT_GUIDE.md` 참조
   - 또는 `docs/generate-placeholders.html` 열어서 placeholder 생성

## 🛠️ 개발 명령어

```bash
# Backend만 실행
npm run dev:backend

# Frontend만 실행
npm run dev:frontend

# Backend 빌드
cd backend
npm run build

# Frontend 빌드
cd frontend
npm run build

# 데이터베이스 초기화
cd backend
rm attendance.db
npm run dev  # 자동으로 재생성됨

# 테스트 데이터 재생성
cd backend
npm run seed -- --force
```

## 🐛 문제 해결

### "Port 3000 is already in use" 오류

다른 프로그램이 포트를 사용 중입니다.

**Windows:**
```bash
netstat -ano | findstr :3000
taskkill /PID [프로세스ID] /F
```

**Mac/Linux:**
```bash
lsof -ti:3000 | xargs kill -9
```

### "Module not found" 오류

의존성이 제대로 설치되지 않았습니다.

```bash
# 캐시 삭제 후 재설치
rm -rf node_modules package-lock.json
npm run install:all
```

### 데이터가 보이지 않음

테스트 데이터가 생성되지 않았을 수 있습니다.

```bash
cd backend
npm run seed -- --force
```

### Frontend가 Backend와 연결되지 않음

Backend가 실행 중인지 확인:
```bash
curl http://localhost:3000/api/employees
```

## 📞 도움이 필요하신가요?

- 📖 **전체 문서**: [README.md](README.md)
- 📸 **스크린샷 가이드**: [docs/SCREENSHOT_GUIDE.md](docs/SCREENSHOT_GUIDE.md)
- 🔧 **상세 설정**: [SETUP.md](SETUP.md) (있는 경우)
- 🐛 **이슈 등록**: GitHub Issues

## ✅ 완료!

축하합니다! 🎉 이제 NFC 기반 근태관리 시스템이 실행되고 있습니다.

코드를 수정하면 자동으로 재시작되므로 바로 개발을 시작할 수 있습니다.

---

**다음 단계**: 실제 Android 태블릿과 NFC 카드로 태깅 기능을 테스트해보세요!

