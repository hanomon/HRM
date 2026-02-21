# 🌐 Google Cloud 웹 콘솔 가이드 (CLI 없이 배포)

> **CLI가 복잡하신가요?** 웹 브라우저만으로 모든 작업을 할 수 있습니다!  
> **난이도**: ⭐⭐☆☆☆ (중급)  
> **소요 시간**: 약 30-40분

---

## 📋 전체 흐름

1. Google Cloud 계정 생성 (5분)
2. 프로젝트 생성 (2분)
3. API 활성화 (5분)
4. Cloud SQL 생성 (10분)
5. Backend 배포 (10분)
6. Frontend 배포 (5분)

---

## 🎯 1단계: Google Cloud 계정 및 프로젝트 설정

### 1-1. 계정 생성

1. **https://console.cloud.google.com** 접속
2. Google 계정으로 로그인
3. 약관 동의
4. **"무료로 시작하기"** 클릭
5. 결제 정보 입력 (신규 가입 시 $300 크레딧 제공)
   - 신용카드 필요하지만 자동 과금 없음
   - 무료 체험 기간 종료 후 수동으로 업그레이드해야 함

### 1-2. 프로젝트 생성

1. 상단 프로젝트 선택 드롭다운 클릭
2. **"새 프로젝트"** 클릭
3. 프로젝트 정보 입력:
   ```
   프로젝트 이름: HRM System
   프로젝트 ID: hrm-system-2024 (고유해야 함)
   ```
4. **"만들기"** 클릭
5. 프로젝트가 생성되면 자동으로 선택됨

---

## ⚙️ 2단계: API 활성화 (웹 콘솔에서)

### 2-1. API 라이브러리 접속

1. 좌측 메뉴 (≡ 햄버거 아이콘) 클릭
2. **"API 및 서비스"** → **"라이브러리"** 클릭

### 2-2. 필요한 API 활성화

다음 API들을 하나씩 검색하고 **"사용 설정"** 버튼 클릭:

**체크리스트:**

- [ ] ☁️ **Cloud Run API**
  - 검색창에 "Cloud Run API" 입력
  - 클릭 → "사용 설정" 버튼

- [ ] 🗄️ **Cloud SQL Admin API**
  - 검색: "Cloud SQL Admin API"
  - "사용 설정" 클릭

- [ ] 🏗️ **Cloud Build API**
  - 검색: "Cloud Build API"
  - "사용 설정" 클릭

- [ ] 📦 **Cloud Storage API**
  - 검색: "Cloud Storage API"
  - 보통 자동 활성화됨

- [ ] 🔐 **Secret Manager API**
  - 검색: "Secret Manager API"
  - "사용 설정" 클릭

- [ ] 🌐 **Compute Engine API**
  - 검색: "Compute Engine API"
  - "사용 설정" 클릭 (첫 번째 활성화 시 몇 분 소요)

> 💡 **팁**: 각 API 활성화는 30초~1분 정도 소요됩니다.

---

## 🗄️ 3단계: Cloud SQL (PostgreSQL) 생성

### 3-1. Cloud SQL 페이지 접속

1. 좌측 메뉴 (≡) → **"SQL"** 클릭
2. **"인스턴스 만들기"** 클릭

### 3-2. PostgreSQL 선택

1. **"PostgreSQL 선택"** 클릭
2. **"PostgreSQL 15 사용 설정"** 클릭 (최신 버전)

### 3-3. 인스턴스 설정 (중요!)

#### **인스턴스 정보**
```
인스턴스 ID: hrm-postgres
비밀번호: [강력한 비밀번호 입력]
  예시: MyStr0ngP@ssw0rd!2024
  ⚠️ 이 비밀번호를 안전하게 저장하세요!
```

#### **데이터베이스 버전**
```
PostgreSQL 15 (기본값)
```

#### **리전 및 영역**
```
리전: asia-northeast3 (서울)
영역 가용성: 단일 영역 (비용 절감)
```

#### **머신 구성 (중요! 💰)**

1. **"머신 구성 표시"** 클릭
2. **"공유 코어"** 선택
3. **"db-f1-micro"** 선택
   ```
   vCPU: 1개 (공유)
   메모리: 0.6GB
   월 예상 비용: ~$7-10
   ```

> ⚠️ **매우 중요**: "경량" 또는 "db-f1-micro"를 선택해야 저렴합니다!

#### **스토리지**
```
스토리지 유형: SSD
용량: 10 GB (최소값)
자동 스토리지 증가: ✅ 체크 (기본값)
```

#### **연결 (중요!)**

1. **"연결" 섹션 확장**
2. **공개 IP**: ✅ **반드시 체크** (Cloud Run에서 접근하려면 필요)
3. **비공개 IP**: ☐ 체크 해제 (추가 비용 발생)

#### **데이터 보호**

1. **"데이터 보호" 섹션 확장**
2. **자동 백업**: ✅ 체크
3. **백업 시간**: 03:00 (새벽 3시)
4. **보관 백업 수**: 3개 (비용 절감)

#### **유지보수**
```
유지보수 기간: 일요일
시작 시간: 04:00 (새벽 4시)
```

3. **"인스턴스 만들기"** 버튼 클릭

⏰ **대기**: 인스턴스 생성에 약 **5-10분** 소요됩니다. 커피 한 잔 하세요! ☕

### 3-4. 데이터베이스 생성

인스턴스가 준비되면 (초록색 체크 표시):

1. 인스턴스 이름 **"hrm-postgres"** 클릭
2. 상단 탭에서 **"데이터베이스"** 클릭
3. **"데이터베이스 만들기"** 클릭
4. **데이터베이스 이름**: `hrm_db`
5. **"만들기"** 클릭

### 3-5. 사용자 생성

1. 상단 탭에서 **"사용자"** 클릭
2. **"사용자 계정 추가"** 클릭
3. **사용자 이름**: `hrm_user`
4. **비밀번호**: [안전한 비밀번호 - 메모장에 저장!]
   - 예시: `HrmUser2024!@#`
5. **"추가"** 클릭

### 3-6. 연결 정보 메모

1. **"개요"** 탭 클릭
2. **"이 인스턴스에 연결"** 섹션 찾기
3. **공개 IP 주소** 복사 (예: `34.64.123.456`)

**메모장에 저장:**
```
====================
Cloud SQL 연결 정보
====================
인스턴스 ID: hrm-postgres
공개 IP: 34.64.123.456
포트: 5432
데이터베이스: hrm_db
사용자: hrm_user
Root 비밀번호: [입력한 비밀번호]
User 비밀번호: [입력한 비밀번호]

연결 문자열:
postgres://hrm_user:[비밀번호]@34.64.123.456:5432/hrm_db

예시:
postgres://hrm_user:HrmUser2024!@34.64.123.456:5432/hrm_db
====================
```

---

## 🔐 4단계: Secret Manager 설정

### 4-1. Secret Manager 페이지 접속

1. 좌측 메뉴 (≡) → **"보안"** → **"Secret Manager"** 클릭
2. 처음 사용 시 **"Secret Manager API 사용 설정"** 클릭
3. **"보안 비밀 만들기"** 클릭

### 4-2. DATABASE_URL 보안 비밀 생성

1. **이름**: `DATABASE_URL`
2. **보안 비밀 값**:
   ```
   postgres://hrm_user:HrmUser2024!@34.64.123.456:5432/hrm_db
   ```
   ⚠️ **본인의 실제 값으로 변경하세요!**
   
3. **리전**: Global (기본값)
4. **"보안 비밀 만들기"** 클릭

### 4-3. NODE_ENV 보안 비밀 생성

1. 다시 **"보안 비밀 만들기"** 클릭
2. **이름**: `NODE_ENV`
3. **보안 비밀 값**: `production`
4. **"보안 비밀 만들기"** 클릭

---

## 🚀 5단계: Backend (Cloud Run) 배포

### 5-1. Cloud Shell로 이미지 빌드

Cloud Run 배포는 Docker 이미지가 필요합니다. Cloud Shell을 사용합니다:

1. **Cloud Console 우측 상단**의 **">_"** (Cloud Shell 활성화) 아이콘 클릭
2. Cloud Shell 터미널이 열림

3. 다음 명령어 실행:

```bash
# GitHub에서 소스 다운로드
git clone https://github.com/hanomon/HRM.git
cd HRM/backend

# 프로젝트 ID 확인 (본인 프로젝트 ID로 변경)
export PROJECT_ID=hrm-system-2024
gcloud config set project $PROJECT_ID

# Docker 이미지 빌드 및 Container Registry에 푸시
gcloud builds submit --tag gcr.io/$PROJECT_ID/hrm-backend

# 완료 메시지 확인: SUCCESS
```

⏰ **대기**: 약 5-10분 소요 (첫 빌드는 더 오래 걸림)

### 5-2. Cloud Run 서비스 생성

빌드가 완료되면:

1. 좌측 메뉴 → **"Cloud Run"** 클릭
2. **"서비스 만들기"** 클릭

#### **컨테이너 이미지 선택**

1. **"SELECT"** 버튼 클릭
2. **Container Registry** 선택
3. **hrm-backend** → **latest** 선택
4. **"선택"** 클릭

또는 직접 입력:
```
gcr.io/hrm-system-2024/hrm-backend:latest
```

#### **서비스 이름 및 리전**
```
서비스 이름: hrm-backend
리전: asia-northeast3 (서울)
```

#### **인증**
```
☑ 인증되지 않은 호출 허용
```

#### **CPU 할당 및 가격 책정**
```
CPU는 요청을 처리하는 동안에만 할당 (권장)
```

#### **최소/최대 인스턴스**
```
최소: 0 (비용 절감! 트래픽 없을 때 $0)
최대: 3 (100명 미만이므로 충분)
```

### 5-3. 컨테이너 설정

1. **"컨테이너, 볼륨, 네트워킹, 보안"** 확장 클릭

#### **컨테이너 탭**
```
컨테이너 포트: 8080
메모리: 512 MiB
CPU: 1
요청당 최대 개수: 80
요청 제한 시간: 60초
```

#### **변수 및 보안 비밀 탭**

1. **"보안 비밀 참조"** 버튼 클릭

**첫 번째 보안 비밀 추가:**
```
이름: DATABASE_URL
보안 비밀 선택: DATABASE_URL
버전: latest
```

**두 번째 보안 비밀 추가:**
```
이름: NODE_ENV
보안 비밀 선택: NODE_ENV
버전: latest
```

**환경 변수 추가:**
```
이름: PORT
값: 8080
```

2. **"만들기"** 클릭!

⏰ **대기**: 배포에 약 2-3분 소요

### 5-4. Backend URL 확인

배포 완료 후:

1. **URL** 자동 생성됨 (예: `https://hrm-backend-xxxxx-an.a.run.app`)
2. **이 URL을 복사하세요!** 📋
3. 메모장에 저장:
   ```
   Backend URL: https://hrm-backend-xxxxx-an.a.run.app
   ```

### 5-5. Backend 테스트

브라우저에서:
```
https://hrm-backend-xxxxx-an.a.run.app/api/health
```

**예상 응답:**
```json
{
  "status": "ok",
  "message": "서버가 정상 작동중입니다."
}
```

✅ 이 메시지가 나오면 Backend 배포 성공!

---

## 🎨 6단계: Frontend (Cloud Storage) 배포

### 6-1. 로컬에서 Frontend 빌드

**로컬 PC 터미널/PowerShell:**

```bash
cd frontend

# Backend URL로 환경 변수 파일 생성
# (위에서 복사한 Cloud Run URL 사용!)
echo VITE_API_URL=https://hrm-backend-xxxxx-an.a.run.app/api > .env.production

# 빌드
npm run build
```

`dist` 폴더가 생성됩니다! ✅

### 6-2. Cloud Storage 버킷 생성

**Google Cloud Console에서:**

1. 좌측 메뉴 → **"Cloud Storage"** → **"버킷"** 클릭
2. **"만들기"** 버튼 클릭

#### **버킷 이름 지정**
```
이름: hrm-frontend-2024
(전 세계에서 고유해야 함 - 숫자를 바꿔보세요)
```

#### **데이터 저장 위치**
```
위치 유형: Region
위치: asia-northeast3 (서울)
```

#### **스토리지 클래스**
```
Standard (기본값)
```

#### **액세스 제어**
```
액세스 제어: 균일 (Uniform) - 권장
```

#### **공개 액세스 방지**
```
☐ 공개 액세스 방지 적용 체크 해제!
(웹사이트로 공개해야 하므로)
```

#### **데이터 보호**
```
버전 관리: ☐ (선택사항)
보존 정책: (설정 안 함)
```

3. **"만들기"** 클릭

확인 메시지: "이 버킷을 공개하시겠습니까?" → **"공개 액세스 허용"** 클릭

### 6-3. 웹사이트 설정

1. 생성된 버킷 클릭: **"hrm-frontend-2024"**
2. 상단 **"구성"** 탭 클릭
3. **"웹사이트 구성"** 섹션 찾기
4. **"수정"** 클릭
5. 설정:
   ```
   기본 페이지 (인덱스): index.html
   404 페이지: index.html
   ```
6. **"저장"** 클릭

### 6-4. 공개 액세스 권한 설정

1. 상단 **"권한"** 탭 클릭
2. **"액세스 권한 부여"** 버튼 클릭
3. **"새 주 구성원 추가"**:
   ```
   새 주 구성원: allUsers
   역할: Storage 객체 뷰어
   ```
4. **"저장"** 클릭
5. 경고: "이 리소스를 공개하시겠습니까?" → **"공개 액세스 허용"** 확인

### 6-5. 파일 업로드

#### **옵션 A: Cloud Shell 사용 (권장)**

Cloud Shell에서:

```bash
cd ~/HRM/frontend

# Backend URL 설정 (본인의 URL로 변경!)
echo "VITE_API_URL=https://hrm-backend-xxxxx-an.a.run.app/api" > .env.production

# Node.js 18 설치
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm install 18
nvm use 18

# 의존성 설치 및 빌드
npm install
npm run build

# Cloud Storage에 업로드
gsutil -m rsync -r -d dist/ gs://hrm-frontend-2024

# 캐시 설정
gsutil -m setmeta -h "Cache-Control:no-cache, max-age=0" \
  gs://hrm-frontend-2024/*.html

gsutil -m setmeta -h "Cache-Control:public, max-age=31536000" \
  gs://hrm-frontend-2024/assets/*

echo "✅ Frontend 배포 완료!"
```

#### **옵션 B: 웹 콘솔에서 직접 업로드**

1. 버킷 **"객체"** 탭
2. **"폴더 업로드"** 클릭
3. 로컬의 `frontend/dist` 폴더 선택
4. 모든 파일 업로드

> ⚠️ **주의**: 파일이 많으면 시간이 오래 걸릴 수 있습니다.

### 6-6. Frontend 접속 확인

**Public URL:**
```
https://storage.googleapis.com/hrm-frontend-2024/index.html
```

브라우저에서 접속하면 웹 애플리케이션이 로드됩니다! 🎉

---

## ✅ 7단계: 배포 완료 확인

### 체크리스트

- [ ] **Cloud SQL 인스턴스 실행 중** (초록색)
- [ ] **Backend API 응답 확인**
  ```
  https://hrm-backend-xxxxx-an.a.run.app/api/health
  → {"status":"ok"...}
  ```
- [ ] **Frontend 접속 확인**
  ```
  https://storage.googleapis.com/hrm-frontend-2024/index.html
  → 웹 페이지 로드됨
  ```
- [ ] **API 연결 확인**
  - Frontend에서 "직원 관리" 클릭
  - 직원 3명이 표시되는지 확인

---

## 📊 8단계: 비용 모니터링 설정

### 8-1. 예산 알림 설정

1. 좌측 메뉴 → **"결제"** 클릭
2. **"예산 및 알림"** 클릭
3. **"예산 만들기"** 클릭

#### **예산 세부정보**
```
이름: HRM Monthly Budget
예산 유형: 지정된 금액
대상 금액: $15
```

#### **알림 임계값**
```
☑ 50% ($7.5)
☑ 90% ($13.5)
☑ 100% ($15)
```

#### **알림 채널**
```
이메일 알림 수신자: [본인 이메일]
```

4. **"완료"** 클릭

---

## 🔄 9단계: 자동 배포 설정 (선택사항)

### 9-1. Cloud Build 트리거 생성

1. 좌측 메뉴 → **"Cloud Build"** → **"트리거"** 클릭
2. **"트리거 만들기"** 클릭

#### **이름**
```
이름: auto-deploy-main
설명: main 브랜치 push 시 자동 배포
```

#### **이벤트**
```
☑ 브랜치에 푸시
```

#### **소스**

1. **"저장소 선택"** 클릭
2. **"소스 저장소 연결"** → **"계속"**
3. **"GitHub (Cloud Build GitHub App)"** 선택
4. **"계속"** → GitHub 인증
5. **"저장소 선택"**:
   - 계정: hanomon
   - 저장소: HRM
6. **"연결"** 클릭
7. 브랜치: `^main$` (정규식)

#### **구성**
```
유형: Cloud Build 구성 파일 (yaml 또는 json)
위치: 저장소
Cloud Build 구성 파일 위치: /cloudbuild.yaml
```

3. **"만들기"** 클릭

**이제 GitHub에 push하면 자동 배포됩니다!** 🎉

---

## 🎯 10단계: 업데이트 배포 방법

### Backend 업데이트

#### **옵션 1: 자동 배포 (CI/CD 설정한 경우)**
```bash
git add .
git commit -m "update: backend changes"
git push origin main
```
→ Cloud Build가 자동으로 빌드 & 배포!

#### **옵션 2: Cloud Shell에서 수동**

1. Cloud Shell 열기
2. 명령어 실행:
```bash
cd ~/HRM/backend
git pull
gcloud builds submit --tag gcr.io/hrm-system-2024/hrm-backend
gcloud run deploy hrm-backend \
  --image gcr.io/hrm-system-2024/hrm-backend:latest \
  --region asia-northeast3
```

### Frontend 업데이트

#### **Cloud Shell에서:**
```bash
cd ~/HRM/frontend
git pull
npm run build
gsutil -m rsync -r -d dist/ gs://hrm-frontend-2024
```

#### **또는 로컬에서 빌드 후 웹 콘솔 업로드:**
1. 로컬: `npm run build`
2. Cloud Storage 버킷 열기
3. 기존 파일 모두 선택 → 삭제
4. 새 dist 폴더 업로드

---

## 💰 11단계: 비용 확인

### 실시간 비용 확인

1. 좌측 메뉴 → **"결제"** 클릭
2. **"개요"** 탭에서 현재 월 누적 비용 확인
3. **"보고서"** 탭에서 서비스별 비용 분석

**예상 비용 (100명 미만):**
```
Cloud Storage:   $0    (무료 티어)
Cloud Run:      $0-2   (거의 무료)
Cloud SQL:      $7-10
─────────────────────
총:             $7-12/월
```

---

## 📱 12단계: Android 태블릿에서 테스트

1. Android 태블릿에서 Chrome 브라우저 열기
2. Frontend URL 접속:
   ```
   https://storage.googleapis.com/hrm-frontend-2024/index.html
   ```
3. "NFC 태깅" 페이지로 이동
4. NFC 카드로 태깅 테스트

> ⚠️ **HTTPS 필요**: Load Balancer 없이는 HTTP만 가능합니다.  
> NFC는 HTTPS 필수이므로 Load Balancer + SSL 설정이 필요합니다.

---

## 🔧 추가 설정 (선택사항)

### Load Balancer + HTTPS 설정

NFC 기능을 사용하려면 **HTTPS가 필수**입니다!

1. 좌측 메뉴 → **"네트워크 서비스"** → **"부하 분산"**
2. **"부하 분산기 만들기"** 클릭
3. **"Application Load Balancer (HTTP/HTTPS)"** 선택
4. **"인터넷 경유 또는 내부 전용"** → **"인터넷 경유"**
5. **"계속"** 클릭

#### **Backend 구성**
1. **"Backend 구성 만들기"** 클릭
2. Backend 유형: **"Backend bucket"**
3. Backend bucket: **"hrm-frontend-2024"** 선택
4. Cloud CDN: ✅ **"Cloud CDN 사용 설정"** (성능 향상!)
5. **"완료"** 클릭

#### **프런트엔드 구성**
1. **"프런트엔드 구성 만들기"** 클릭
2. 프로토콜: **"HTTPS"** (권장)
3. IP 버전: IPv4
4. IP 주소: **"IP 주소 만들기"**
   - 이름: `hrm-frontend-ip`
   - **"예약"** 클릭
5. 인증서: 
   - **"새 인증서 만들기"**
   - 도메인이 없으면 **"HTTP만 사용"**으로 변경 (임시)
6. **"완료"** 클릭

7. **"만들기"** 클릭 (Load Balancer 생성)

⏰ 대기: 약 5-10분

#### **Frontend URL**
```
HTTP: http://[IP 주소]/index.html
HTTPS: https://[IP 주소]/index.html (인증서 설정 시)
```

---

## 🎊 완료!

축하합니다! Google Cloud에 성공적으로 배포되었습니다! 🚀

### 📍 최종 URL

```
Backend:  https://hrm-backend-xxxxx-an.a.run.app
Frontend: https://storage.googleapis.com/hrm-frontend-2024/index.html
          또는 http://[Load Balancer IP]/index.html
```

### 💰 예상 월 비용

```
Cloud Storage:  $0
Cloud CDN:      $0
Cloud Run:      $0-2
Cloud SQL:      $7-10
──────────────────
총:             $7-12/월
```

Render($21/월) 대비 **약 50% 절감!** 💸

---

## 🆘 자주 발생하는 문제

### ❌ "권한 거부" 오류

**해결:**
1. 좌측 메뉴 → **"IAM 및 관리자"** → **"IAM"**
2. 본인 계정 찾기
3. **"수정"** (연필 아이콘) 클릭
4. 다음 역할 추가:
   - Cloud Run 관리자
   - Cloud SQL 관리자
   - Storage 관리자
   - Secret Manager 관리자

### ❌ Cloud Run이 시작되지 않음

**해결:**
1. Cloud Run 서비스 클릭
2. **"로그"** 탭 클릭
3. 에러 메시지 확인
4. 주요 원인:
   - DATABASE_URL 오류 → Secret Manager 값 재확인
   - 포트 문제 → PORT=8080 확인
   - 메모리 부족 → 512Mi → 1Gi로 증가

### ❌ Frontend에서 API 호출 안 됨

**해결:**
1. 브라우저 F12 → Console 탭
2. CORS 에러 확인
3. Backend에 Frontend URL 추가 필요:
   - Cloud Run 서비스 → "수정 및 새 버전 배포"
   - 환경 변수 추가:
     ```
     FRONTEND_URL=https://storage.googleapis.com
     ```
4. 다시 배포

---

## 📚 유용한 링크

### **주요 페이지**

| 페이지 | URL |
|--------|-----|
| Cloud Console | https://console.cloud.google.com |
| Cloud Run | https://console.cloud.google.com/run |
| Cloud SQL | https://console.cloud.google.com/sql |
| Cloud Storage | https://console.cloud.google.com/storage |
| Secret Manager | https://console.cloud.google.com/security/secret-manager |
| 결제 및 비용 | https://console.cloud.google.com/billing |
| Cloud Build | https://console.cloud.google.com/cloud-build |

### **문서**

- 📖 [전체 CLI 가이드](GOOGLE_CLOUD_MIGRATION.md)
- ⚡ [5분 빠른 시작](GOOGLE_CLOUD_QUICKSTART.md)
- 📄 [프로젝트 README](README.md)

---

## 🎉 성공!

이제 Google Cloud에서 HRM 시스템이 실행 중입니다!

**달성한 것:**
- ✅ 비용 50% 절감 ($21 → $7-12/월)
- ✅ 데이터 영구 저장 (Cloud SQL)
- ✅ Auto-scaling (Cloud Run)
- ✅ CDN으로 빠른 로딩 (선택사항)
- ✅ 모든 작업을 웹에서 완료!

**CLI 없이 웹 콘솔만으로 모든 작업을 완료했습니다!** 🌐✨

---

**작성일**: 2026-01-06  
**난이도**: ⭐⭐☆☆☆  
**CLI 필요**: ❌ 전혀 필요 없음!  
**브라우저만**: ✅ Chrome/Edge 권장
