#!/bin/bash

# 환경 변수 설정 도우미 스크립트
# 사용법: ./scripts/setup-env.sh

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}🔧 환경 변수 설정 시작${NC}"
echo ""

# ==========================================
# 1. 프로젝트 정보 입력
# ==========================================

read -p "Google Cloud Project ID: " PROJECT_ID
read -p "Cloud SQL 인스턴스 IP: " SQL_IP
read -sp "데이터베이스 비밀번호: " DB_PASSWORD
echo ""
read -p "Cloud Run 리전 (기본: asia-northeast3): " REGION
REGION=${REGION:-asia-northeast3}

# ==========================================
# 2. Secret Manager에 저장
# ==========================================

echo ""
echo -e "${YELLOW}📦 Secret Manager에 저장 중...${NC}"

# DATABASE_URL
DATABASE_URL="postgres://hrm_user:$DB_PASSWORD@$SQL_IP:5432/hrm_db"
echo -n "$DATABASE_URL" | gcloud secrets create DATABASE_URL \
  --data-file=- \
  --project=$PROJECT_ID \
  2>/dev/null || echo -n "$DATABASE_URL" | gcloud secrets versions add DATABASE_URL \
  --data-file=- \
  --project=$PROJECT_ID

echo -e "${GREEN}✅ DATABASE_URL 저장됨${NC}"

# NODE_ENV
echo -n "production" | gcloud secrets create NODE_ENV \
  --data-file=- \
  --project=$PROJECT_ID \
  2>/dev/null || echo -n "production" | gcloud secrets versions add NODE_ENV \
  --data-file=- \
  --project=$PROJECT_ID

echo -e "${GREEN}✅ NODE_ENV 저장됨${NC}"

# ==========================================
# 3. Backend URL 가져오기 (배포 후)
# ==========================================

echo ""
echo -e "${YELLOW}📍 Backend URL 확인 중...${NC}"

BACKEND_URL=$(gcloud run services describe hrm-backend \
  --region $REGION \
  --project $PROJECT_ID \
  --format 'value(status.url)' 2>/dev/null || echo "")

if [ -n "$BACKEND_URL" ]; then
  echo -e "${GREEN}Backend URL: $BACKEND_URL${NC}"
  
  # Frontend .env.production 생성
  echo "VITE_API_URL=$BACKEND_URL/api" > frontend/.env.production
  echo -e "${GREEN}✅ frontend/.env.production 생성됨${NC}"
else
  echo -e "${YELLOW}⚠️  Backend가 아직 배포되지 않았습니다${NC}"
  echo "Backend 배포 후 다시 실행해주세요."
fi

# ==========================================
# 4. 로컬 개발용 .env 생성
# ==========================================

echo ""
read -p "로컬 개발용 .env 파일을 생성하시겠습니까? (y/n): " CREATE_LOCAL
if [ "$CREATE_LOCAL" = "y" ] || [ "$CREATE_LOCAL" = "Y" ]; then
  cat > backend/.env << EOF
DATABASE_URL=postgres://hrm_user:$DB_PASSWORD@$SQL_IP:5432/hrm_db
NODE_ENV=development
PORT=3000
EOF
  echo -e "${GREEN}✅ backend/.env 생성됨${NC}"
  
  cat > frontend/.env << EOF
VITE_API_URL=http://localhost:3000/api
EOF
  echo -e "${GREEN}✅ frontend/.env 생성됨${NC}"
fi

# ==========================================
# 5. 완료
# ==========================================

echo ""
echo -e "${GREEN}🎉 환경 변수 설정 완료!${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${YELLOW}다음 단계:${NC}"
echo "1. Backend 배포: cd backend && gcloud builds submit --tag gcr.io/$PROJECT_ID/hrm-backend"
echo "2. Cloud Run 배포: gcloud run deploy hrm-backend ..."
echo "3. Frontend 배포: ./scripts/deploy-gcp.sh"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
