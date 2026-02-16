#!/bin/bash

# Google Cloud 배포 스크립트
# 사용법: ./scripts/deploy-gcp.sh

set -e  # 에러 발생 시 중단

# 색상 코드
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Google Cloud 배포 시작${NC}"

# ==========================================
# 1. 환경 변수 확인
# ==========================================

if [ -z "$GCP_PROJECT_ID" ]; then
  echo -e "${RED}❌ GCP_PROJECT_ID 환경 변수가 설정되지 않았습니다${NC}"
  echo "export GCP_PROJECT_ID=your-project-id"
  exit 1
fi

GCP_REGION=${GCP_REGION:-"asia-northeast3"}
SERVICE_NAME=${SERVICE_NAME:-"hrm-backend"}

echo -e "${YELLOW}📋 배포 설정:${NC}"
echo "  Project ID: $GCP_PROJECT_ID"
echo "  Region: $GCP_REGION"
echo "  Service: $SERVICE_NAME"
echo ""

# ==========================================
# 2. Backend 배포
# ==========================================

echo -e "${GREEN}📦 Backend 빌드 중...${NC}"
cd backend

# Docker 이미지 빌드 및 푸시
gcloud builds submit \
  --tag gcr.io/$GCP_PROJECT_ID/$SERVICE_NAME \
  --project $GCP_PROJECT_ID

echo -e "${GREEN}🚢 Backend 배포 중...${NC}"
gcloud run deploy $SERVICE_NAME \
  --image gcr.io/$GCP_PROJECT_ID/$SERVICE_NAME \
  --platform managed \
  --region $GCP_REGION \
  --allow-unauthenticated \
  --min-instances 0 \
  --max-instances 3 \
  --memory 512Mi \
  --cpu 1 \
  --timeout 60 \
  --set-secrets="DATABASE_URL=DATABASE_URL:latest,NODE_ENV=NODE_ENV:latest" \
  --project $GCP_PROJECT_ID

# Backend URL 가져오기
BACKEND_URL=$(gcloud run services describe $SERVICE_NAME \
  --region $GCP_REGION \
  --format 'value(status.url)' \
  --project $GCP_PROJECT_ID)

echo -e "${GREEN}✅ Backend 배포 완료: $BACKEND_URL${NC}"

# ==========================================
# 3. Frontend 배포
# ==========================================

cd ../frontend

echo -e "${GREEN}🎨 Frontend 빌드 중...${NC}"

# .env.production 생성
cat > .env.production << EOF
VITE_API_URL=$BACKEND_URL/api
EOF

# 빌드
npm run build

# Cloud Storage 업로드
BUCKET_NAME=${GCS_BUCKET_NAME:-"hrm-frontend-$GCP_PROJECT_ID"}

echo -e "${GREEN}☁️  Frontend 업로드 중...${NC}"

# 버킷 존재 확인 및 생성
if ! gsutil ls gs://$BUCKET_NAME &> /dev/null; then
  echo "버킷 생성 중: $BUCKET_NAME"
  gsutil mb -l $GCP_REGION gs://$BUCKET_NAME
  gsutil web set -m index.html -e index.html gs://$BUCKET_NAME
  gsutil iam ch allUsers:objectViewer gs://$BUCKET_NAME
fi

# 파일 업로드
gsutil -m rsync -r -d dist/ gs://$BUCKET_NAME

# 캐시 설정
gsutil -m setmeta -h "Cache-Control:no-cache, max-age=0" \
  gs://$BUCKET_NAME/*.html

gsutil -m setmeta -h "Cache-Control:public, max-age=31536000" \
  gs://$BUCKET_NAME/assets/*

FRONTEND_URL="https://storage.googleapis.com/$BUCKET_NAME/index.html"

echo -e "${GREEN}✅ Frontend 배포 완료: $FRONTEND_URL${NC}"

# ==========================================
# 4. 배포 완료
# ==========================================

echo ""
echo -e "${GREEN}🎉 배포가 완료되었습니다!${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${YELLOW}📍 배포된 URL:${NC}"
echo "  Backend:  $BACKEND_URL"
echo "  Frontend: $FRONTEND_URL"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${YELLOW}🧪 테스트:${NC}"
echo "  curl $BACKEND_URL/api/info"
echo "  open $FRONTEND_URL"
echo ""
echo -e "${YELLOW}📊 로그 확인:${NC}"
echo "  gcloud run services logs read $SERVICE_NAME --region $GCP_REGION --limit 50"
echo ""

# ==========================================
# 5. 헬스체크
# ==========================================

echo -e "${YELLOW}🏥 헬스체크 중...${NC}"
sleep 3

if curl -sf "$BACKEND_URL/api/info" > /dev/null; then
  echo -e "${GREEN}✅ Backend API가 정상적으로 작동 중입니다!${NC}"
else
  echo -e "${RED}❌ Backend API 응답 없음. 로그를 확인하세요:${NC}"
  echo "  gcloud run services logs read $SERVICE_NAME --region $GCP_REGION"
  exit 1
fi

echo ""
echo -e "${GREEN}🚀 모든 배포가 성공적으로 완료되었습니다!${NC}"
