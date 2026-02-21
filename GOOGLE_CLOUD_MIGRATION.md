# 🚀 Google Cloud 마이그레이션 가이드 (Hybrid 최적화)

> **목표**: Render → Google Cloud 마이그레이션 (월 비용 최소화)  
> **예상 트래픽**: 100명 미만  
> **예상 비용**: 월 $5-10 (무료 티어 최대 활용)
>
> 💡 **CLI가 어렵다면?** **[웹 콘솔 가이드](GOOGLE_CLOUD_WEB_GUIDE.md)** 추천! (클릭만으로 배포 가능)

---

## 📊 아키텍처 개요

### 🎯 **최적화된 Hybrid 구성**

```
┌─────────────────────────────────────────────────────────────┐
│                     Google Cloud Platform                    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────┐    ┌──────────────────┐               │
│  │  Cloud Storage   │    │    Cloud Run     │               │
│  │  + Cloud CDN     │◄───┤   (Backend API)  │               │
│  │   (Frontend)     │    │                  │               │
│  └──────────────────┘    └────────┬─────────┘               │
│                                   │                          │
│                                   ▼                          │
│                          ┌──────────────────┐               │
│                          │   Cloud SQL      │               │
│                          │  (PostgreSQL)    │               │
│                          └──────────────────┘               │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### 💰 **예상 비용 (월 기준, 100명 미만)**

| 서비스 | 무료 티어 | 예상 사용량 | 예상 비용 |
|--------|-----------|-------------|-----------|
| **Cloud Storage** | 5GB 무료 | ~500MB | **$0** |
| **Cloud CDN** | 1TB 무료 (중국/호주 제외) | ~10GB | **$0** |
| **Cloud Run** | 200만 요청/월 무료 | ~5만 요청 | **$0-2** |
| **Cloud SQL** | 없음 | db-f1-micro | **$7-10** |
| **Cloud Build** | 120분/일 무료 | ~10분/일 | **$0** |
| **Container Registry** | 5GB 무료 | ~1GB | **$0** |
| **Secret Manager** | 6개 무료 | 3개 | **$0** |
| **총 합계** | - | - | **$7-12/월** |

> 💡 **팁**: Render($21/월) 대비 **약 50-60% 비용 절감**

---

## 📋 사전 준비사항

### 1️⃣ Google Cloud 계정 설정

1. **Google Cloud 계정 생성**
   - https://console.cloud.google.com
   - 신규 가입시 $300 크레딧 제공 (90일)

2. **프로젝트 생성**
   ```bash
   # 프로젝트 ID 예시: hrm-system-2024
   gcloud projects create hrm-system-2024 --name="HRM System"
   ```

3. **결제 계정 연결**
   - Navigation Menu → Billing → Link Billing Account
   - 신용카드 등록 (무료 티어도 필요)

### 2️⃣ Google Cloud CLI 설치

**Windows:**
```powershell
# Chocolatey로 설치 (권장)
choco install gcloudsdk

# 또는 설치 프로그램 다운로드
# https://cloud.google.com/sdk/docs/install
```

**macOS:**
```bash
brew install --cask google-cloud-sdk
```

**Linux:**
```bash
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
```

### 3️⃣ gcloud 초기화

```bash
# 로그인
gcloud auth login

# 프로젝트 설정
gcloud config set project hrm-system-2024

# 기본 리전 설정 (서울)
gcloud config set compute/region asia-northeast3
gcloud config set compute/zone asia-northeast3-a

# 현재 설정 확인
gcloud config list
```

### 4️⃣ 필요한 API 활성화

```bash
# 한 번에 모든 API 활성화
gcloud services enable \
  run.googleapis.com \
  sql-component.googleapis.com \
  sqladmin.googleapis.com \
  cloudbuild.googleapis.com \
  storage-api.googleapis.com \
  secretmanager.googleapis.com \
  cloudresourcemanager.googleapis.com
```

---

## 🗄️ 1단계: Cloud SQL (PostgreSQL) 설정

### 1-1. Cloud SQL 인스턴스 생성

```bash
# db-f1-micro 인스턴스 생성 (가장 저렴한 옵션)
gcloud sql instances create hrm-postgres \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=asia-northeast3 \
  --root-password=YOUR_STRONG_PASSWORD \
  --backup-start-time=03:00 \
  --maintenance-window-day=SUN \
  --maintenance-window-hour=4 \
  --no-assign-ip \
  --network=default

# 공개 IP 할당 (Cloud Run에서 접근하려면 필요)
gcloud sql instances patch hrm-postgres \
  --assign-ip
```

### 1-2. 데이터베이스 생성

```bash
# 데이터베이스 생성
gcloud sql databases create hrm_db \
  --instance=hrm-postgres

# 사용자 생성
gcloud sql users create hrm_user \
  --instance=hrm-postgres \
  --password=YOUR_DB_USER_PASSWORD
```

### 1-3. Render에서 데이터 백업

```bash
# Render PostgreSQL에서 데이터 덤프
# Render 대시보드에서 Connection String 복사 후:

pg_dump "postgres://user:pass@host/db" > render_backup.sql
```

### 1-4. Cloud SQL로 데이터 복원

```bash
# Cloud SQL Proxy 설치 (로컬에서 접근하기 위해)
gcloud components install cloud-sql-proxy

# Proxy 실행 (별도 터미널)
./cloud-sql-proxy hrm-system-2024:asia-northeast3:hrm-postgres

# 데이터 복원 (다른 터미널)
psql -h 127.0.0.1 -U hrm_user -d hrm_db < render_backup.sql
```

### 1-5. 연결 문자열 생성

```bash
# Cloud SQL 연결 정보 확인
gcloud sql instances describe hrm-postgres

# 연결 문자열 형식:
# postgres://hrm_user:YOUR_DB_USER_PASSWORD@INSTANCE_IP:5432/hrm_db
```

---

## 🔐 2단계: Secret Manager 설정

### 2-1. 환경 변수를 Secret으로 저장

```bash
# DATABASE_URL 저장
echo -n "postgres://hrm_user:YOUR_PASSWORD@INSTANCE_IP:5432/hrm_db" | \
  gcloud secrets create DATABASE_URL --data-file=-

# PORT (Cloud Run에서 자동 설정되지만 명시적으로 저장 가능)
echo -n "8080" | \
  gcloud secrets create PORT --data-file=-

# NODE_ENV
echo -n "production" | \
  gcloud secrets create NODE_ENV --data-file=-

# Secret 목록 확인
gcloud secrets list
```

### 2-2. Secret 버전 확인

```bash
# 특정 Secret 내용 확인 (테스트용)
gcloud secrets versions access latest --secret="DATABASE_URL"
```

---

## 🐳 3단계: Backend (Cloud Run) 배포

### 3-1. Dockerfile 확인

`backend/Dockerfile`이 이미 생성되어 있습니다! ✅

### 3-2. 로컬에서 Docker 이미지 빌드 및 테스트

```bash
cd backend

# 이미지 빌드
docker build -t hrm-backend .

# 로컬 테스트
docker run -p 8080:8080 \
  -e DATABASE_URL="postgres://..." \
  -e NODE_ENV="production" \
  hrm-backend

# 다른 터미널에서 테스트
curl http://localhost:8080/api/info
```

### 3-3. Cloud Run에 배포

```bash
# 프로젝트 루트에서 실행
cd backend

# Cloud Build로 이미지 빌드 및 Container Registry에 푸시
gcloud builds submit \
  --tag gcr.io/hrm-system-2024/hrm-backend

# Cloud Run에 배포
gcloud run deploy hrm-backend \
  --image gcr.io/hrm-system-2024/hrm-backend \
  --platform managed \
  --region asia-northeast3 \
  --allow-unauthenticated \
  --min-instances 0 \
  --max-instances 3 \
  --memory 512Mi \
  --cpu 1 \
  --timeout 60 \
  --set-secrets="DATABASE_URL=DATABASE_URL:latest,NODE_ENV=NODE_ENV:latest" \
  --set-env-vars="PORT=8080"
```

### 3-4. Backend URL 확인

```bash
# 배포 완료 후 URL 확인
gcloud run services describe hrm-backend \
  --region asia-northeast3 \
  --format 'value(status.url)'

# 예: https://hrm-backend-xxxxx-an.a.run.app
```

### 3-5. Backend API 테스트

```bash
# API 엔드포인트 테스트
export BACKEND_URL="https://hrm-backend-xxxxx-an.a.run.app"

curl $BACKEND_URL/api/info
curl $BACKEND_URL/api/employees
```

---

## 🌐 4단계: Frontend (Cloud Storage + CDN) 배포

### 4-1. Cloud Storage 버킷 생성

```bash
# 버킷 이름은 글로벌하게 고유해야 함
export BUCKET_NAME="hrm-frontend-2024"

# 버킷 생성
gsutil mb -l asia-northeast3 gs://$BUCKET_NAME

# 웹 호스팅 설정
gsutil web set -m index.html -e index.html gs://$BUCKET_NAME

# 공개 액세스 설정
gsutil iam ch allUsers:objectViewer gs://$BUCKET_NAME
```

### 4-2. Frontend 빌드 (Backend URL 설정)

```bash
cd frontend

# .env.production 파일 생성
cat > .env.production << EOF
VITE_API_URL=https://hrm-backend-xxxxx-an.a.run.app/api
EOF

# 빌드
npm run build
```

### 4-3. Cloud Storage에 업로드

```bash
# dist 폴더를 버킷에 업로드
gsutil -m rsync -r -d dist/ gs://$BUCKET_NAME

# 캐시 설정 (HTML은 짧게, JS/CSS는 길게)
gsutil -m setmeta -h "Cache-Control:no-cache, max-age=0" \
  gs://$BUCKET_NAME/*.html

gsutil -m setmeta -h "Cache-Control:public, max-age=31536000" \
  gs://$BUCKET_NAME/assets/*
```

### 4-4. Cloud CDN 설정 (선택사항이지만 권장)

```bash
# Load Balancer 생성 (Cloud Console에서 권장)
# Navigation Menu → Network Services → Load balancing
```

**Cloud Console에서 설정** (추천):
1. **Load balancing** → **Create load balancer**
2. **Application Load Balancer (HTTP/HTTPS)** 선택
3. **Backend configuration**:
   - Backend bucket: `hrm-frontend-2024` 선택
   - Enable Cloud CDN ✅
4. **Frontend configuration**:
   - Protocol: HTTP (또는 HTTPS with SSL certificate)
   - IP: Reserve static IP
5. **Create** 클릭

### 4-5. 커스텀 도메인 설정 (선택사항)

```bash
# 도메인이 있는 경우
gcloud compute backend-buckets update hrm-frontend-backend \
  --custom-response-header="Cross-Origin-Opener-Policy: same-origin" \
  --custom-response-header="Cross-Origin-Embedder-Policy: require-corp"
```

---

## 🔄 5단계: CI/CD 파이프라인 설정

### 5-1. Cloud Build 트리거 생성

```bash
# GitHub 연동
gcloud alpha builds triggers create github \
  --repo-name=HRM \
  --repo-owner=YOUR_GITHUB_USERNAME \
  --branch-pattern="^main$" \
  --build-config=cloudbuild.yaml

# 또는 Cloud Console에서 설정
# Cloud Build → Triggers → Connect Repository
```

### 5-2. GitHub에 Push하면 자동 배포

```bash
git add .
git commit -m "feat: migrate to Google Cloud"
git push origin main

# Cloud Build가 자동으로 빌드 & 배포 시작
# Cloud Console → Cloud Build → History에서 확인
```

---

## 🎯 6단계: 마이그레이션 완료 체크리스트

### ✅ **배포 확인**

- [ ] Cloud SQL 인스턴스 생성 및 데이터 마이그레이션
- [ ] Secret Manager에 환경 변수 저장
- [ ] Backend Cloud Run 배포 및 API 테스트
- [ ] Frontend Cloud Storage 배포 및 접근 확인
- [ ] Cloud CDN 설정 (선택사항)
- [ ] 커스텀 도메인 연결 (선택사항)

### ✅ **기능 테스트**

```bash
# Backend API 테스트
curl https://hrm-backend-xxxxx.run.app/api/info
curl https://hrm-backend-xxxxx.run.app/api/employees
curl -X POST https://hrm-backend-xxxxx.run.app/api/attendance \
  -H "Content-Type: application/json" \
  -d '{"nfc_id":"04A1B2C3D4E5F6","tag_type":"check_in"}'

# Frontend 접근
open http://LOAD_BALANCER_IP
# 또는
open http://storage.googleapis.com/hrm-frontend-2024/index.html
```

### ✅ **모니터링 설정**

```bash
# Cloud Run 로그 확인
gcloud run services logs read hrm-backend \
  --region asia-northeast3 \
  --limit 50

# Cloud SQL 연결 상태 확인
gcloud sql operations list \
  --instance=hrm-postgres
```

---

## 💡 비용 최적화 팁

### 1️⃣ **Cloud Run 최적화**

```bash
# 최소 인스턴스를 0으로 설정 (트래픽 없을 때 요금 없음)
gcloud run services update hrm-backend \
  --min-instances 0 \
  --region asia-northeast3

# Cold start 개선이 필요하면:
gcloud run services update hrm-backend \
  --min-instances 1 \
  --region asia-northeast3
# (단, 월 약 $3-5 추가 비용 발생)
```

### 2️⃣ **Cloud SQL 최적화**

```bash
# 개발/테스트 시간에는 인스턴스 중지 가능
gcloud sql instances patch hrm-postgres --activation-policy=NEVER

# 사용 재개
gcloud sql instances patch hrm-postgres --activation-policy=ALWAYS

# 자동 백업 보관 기간 최소화 (기본 7일)
gcloud sql instances patch hrm-postgres \
  --backup-start-time=03:00 \
  --retained-backups-count=3
```

### 3️⃣ **Cloud Storage 최적화**

```bash
# 오래된 파일 자동 삭제 정책 (선택사항)
gsutil lifecycle set lifecycle.json gs://$BUCKET_NAME

# lifecycle.json 예시:
{
  "lifecycle": {
    "rule": [
      {
        "action": {"type": "Delete"},
        "condition": {"age": 90}
      }
    ]
  }
}
```

### 4️⃣ **Container Registry 최적화**

```bash
# 오래된 이미지 정리
gcloud container images list-tags gcr.io/hrm-system-2024/hrm-backend

# 특정 이미지 삭제
gcloud container images delete gcr.io/hrm-system-2024/hrm-backend:OLD_TAG
```

---

## 📊 모니터링 & 알림 설정

### 1️⃣ **비용 알림 설정**

1. **Cloud Console** → **Billing** → **Budgets & alerts**
2. **Create Budget** 클릭
3. 예산 금액: $15/월 설정
4. 알림: 50%, 90%, 100% 도달 시 이메일

### 2️⃣ **Uptime 모니터링**

```bash
# Uptime Check 생성 (Cloud Console)
# Monitoring → Uptime checks → Create uptime check
```

**설정**:
- URL: `https://hrm-backend-xxxxx.run.app/api/info`
- Frequency: 5분
- Alert: 연속 3회 실패 시 이메일

### 3️⃣ **로그 기반 알림**

```bash
# 에러 로그 알림 설정
gcloud logging metrics create error_count \
  --description="Count of ERROR logs" \
  --log-filter='severity=ERROR'
```

---

## 🆘 트러블슈팅

### ❌ **Cloud Run 배포 실패**

```bash
# 상세 로그 확인
gcloud run services logs read hrm-backend --limit=100

# 컨테이너 로그 확인
gcloud logging read "resource.type=cloud_run_revision" --limit=50

# 일반적인 원인:
# 1. PORT 환경 변수 미설정 → Dockerfile에 ENV PORT=8080 추가
# 2. 헬스체크 실패 → /api/info 엔드포인트 확인
# 3. 메모리 부족 → --memory 512Mi → 1Gi로 증가
```

### ❌ **Cloud SQL 연결 실패**

```bash
# Cloud SQL 상태 확인
gcloud sql instances describe hrm-postgres

# 연결 테스트
gcloud sql connect hrm-postgres --user=hrm_user

# 일반적인 원인:
# 1. IP 화이트리스트 → Cloud Run IP 추가 또는 --no-assign-ip 제거
# 2. SSL 설정 → DATABASE_URL에 ?sslmode=require 추가
# 3. 비밀번호 오류 → Secret Manager 값 확인
```

### ❌ **Frontend 404 에러**

```bash
# 버킷 권한 확인
gsutil iam get gs://$BUCKET_NAME

# allUsers에 objectViewer 권한 있는지 확인
# 없으면:
gsutil iam ch allUsers:objectViewer gs://$BUCKET_NAME

# index.html 존재 확인
gsutil ls gs://$BUCKET_NAME/
```

### ❌ **CORS 에러**

Backend에서 CORS 설정 확인:

```typescript
// backend/src/index.ts
app.use(cors({
  origin: [
    'https://storage.googleapis.com',
    'http://LOAD_BALANCER_IP',
    'https://your-custom-domain.com'
  ],
  credentials: true
}));
```

---

## 📚 추가 리소스

### 📖 **공식 문서**
- [Cloud Run 문서](https://cloud.google.com/run/docs)
- [Cloud SQL 문서](https://cloud.google.com/sql/docs)
- [Cloud Storage 문서](https://cloud.google.com/storage/docs)
- [Cloud Build 문서](https://cloud.google.com/build/docs)

### 💰 **비용 계산기**
- [Google Cloud Pricing Calculator](https://cloud.google.com/products/calculator)

### 🎓 **학습 자료**
- [Google Cloud Skills Boost](https://www.cloudskillsboost.google)
- [Qwiklabs Free Tier](https://go.qwiklabs.com)

---

## 🎉 마이그레이션 완료!

축하합니다! Render에서 Google Cloud로 성공적으로 마이그레이션했습니다! 🚀

### 📊 **달성한 것들**

✅ **비용 절감**: 월 $21 → $7-12 (약 50% 절감)  
✅ **성능 향상**: CDN을 통한 빠른 응답  
✅ **확장성**: Auto-scaling 준비 완료  
✅ **관리 편의성**: CI/CD 자동화  
✅ **무료 티어**: 대부분의 서비스 무료 사용  

### 🔗 **유용한 링크**

- **Cloud Console**: https://console.cloud.google.com
- **Backend URL**: `https://hrm-backend-xxxxx.run.app`
- **Frontend URL**: `http://LOAD_BALANCER_IP`
- **Database**: `hrm-postgres` in `asia-northeast3`

### 📞 **도움이 필요하신가요?**

이슈가 있거나 추가 도움이 필요하시면 언제든지 문의해주세요! 💬

---

**작성일**: 2026-02-16  
**작성자**: Claude AI Assistant  
**버전**: 1.0.0
