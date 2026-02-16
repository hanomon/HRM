# ⚡ Google Cloud 빠른 시작 가이드 (5분)

> 이미 Google Cloud 계정이 있고 빠르게 배포하고 싶으신 분들을 위한 간소화 가이드

---

## 🚀 빠른 배포 (5개 명령어)

### 1️⃣ 사전 준비 (1회만)

```bash
# gcloud 로그인 및 프로젝트 설정
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
gcloud config set compute/region asia-northeast3

# API 활성화
gcloud services enable run.googleapis.com sql-component.googleapis.com sqladmin.googleapis.com cloudbuild.googleapis.com storage-api.googleapis.com secretmanager.googleapis.com
```

### 2️⃣ Cloud SQL 생성

```bash
# PostgreSQL 인스턴스 생성 (약 5분 소요)
gcloud sql instances create hrm-postgres \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=asia-northeast3 \
  --root-password=STRONG_PASSWORD_HERE \
  --assign-ip

# 데이터베이스 생성
gcloud sql databases create hrm_db --instance=hrm-postgres
gcloud sql users create hrm_user --instance=hrm-postgres --password=DB_USER_PASSWORD
```

### 3️⃣ Secret Manager 설정

```bash
# DATABASE_URL 저장 (IP는 Cloud SQL 인스턴스 IP로 변경)
echo -n "postgres://hrm_user:DB_USER_PASSWORD@INSTANCE_IP:5432/hrm_db" | \
  gcloud secrets create DATABASE_URL --data-file=-

echo -n "production" | gcloud secrets create NODE_ENV --data-file=-
```

### 4️⃣ Backend 배포

```bash
cd backend
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/hrm-backend

gcloud run deploy hrm-backend \
  --image gcr.io/YOUR_PROJECT_ID/hrm-backend \
  --platform managed \
  --region asia-northeast3 \
  --allow-unauthenticated \
  --min-instances 0 \
  --max-instances 3 \
  --memory 512Mi \
  --set-secrets="DATABASE_URL=DATABASE_URL:latest,NODE_ENV=NODE_ENV:latest"
```

### 5️⃣ Frontend 배포

```bash
cd ../frontend

# Backend URL 설정
export BACKEND_URL=$(gcloud run services describe hrm-backend --region asia-northeast3 --format 'value(status.url)')
echo "VITE_API_URL=$BACKEND_URL/api" > .env.production

# 빌드 및 배포
npm run build
export BUCKET_NAME="hrm-frontend-$(date +%s)"
gsutil mb -l asia-northeast3 gs://$BUCKET_NAME
gsutil web set -m index.html -e index.html gs://$BUCKET_NAME
gsutil iam ch allUsers:objectViewer gs://$BUCKET_NAME
gsutil -m rsync -r -d dist/ gs://$BUCKET_NAME
```

---

## ✅ 배포 확인

```bash
# Backend 테스트
curl $(gcloud run services describe hrm-backend --region asia-northeast3 --format 'value(status.url)')/api/info

# Frontend URL 확인
echo "Frontend: http://storage.googleapis.com/$BUCKET_NAME/index.html"
```

---

## 🎯 완료!

- **Backend**: Cloud Run에서 실행 중 ✅
- **Database**: Cloud SQL PostgreSQL ✅
- **Frontend**: Cloud Storage ✅

**상세 가이드**: `GOOGLE_CLOUD_MIGRATION.md` 참고

---

## 🔄 업데이트 배포

```bash
# Backend 업데이트
cd backend
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/hrm-backend
gcloud run deploy hrm-backend --image gcr.io/YOUR_PROJECT_ID/hrm-backend --region asia-northeast3

# Frontend 업데이트
cd frontend
npm run build
gsutil -m rsync -r -d dist/ gs://$BUCKET_NAME
```

---

## 💰 예상 비용

- 100명 미만 트래픽: **월 $7-12**
- 무료 티어 최대 활용 시: **월 $7 정도**

---

## 📞 문제 발생 시

상세 가이드 참고: `GOOGLE_CLOUD_MIGRATION.md`

**주요 명령어**:
```bash
# 로그 확인
gcloud run services logs read hrm-backend --limit 50

# Cloud SQL 연결 테스트
gcloud sql connect hrm-postgres --user=hrm_user

# Secret 확인
gcloud secrets versions access latest --secret="DATABASE_URL"
```
