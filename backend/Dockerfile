# Backend Dockerfile for Google Cloud Run
FROM node:18-alpine

# 작업 디렉토리 설정
WORKDIR /app

# package.json과 package-lock.json 복사
COPY package*.json ./

# 의존성 설치
RUN npm ci --only=production

# TypeScript 및 빌드 도구 설치
RUN npm install -g typescript tsx

# 소스 코드 복사
COPY . .

# TypeScript 빌드
RUN npm run build

# 프로덕션 환경 설정
ENV NODE_ENV=production

# 포트 설정 (Cloud Run은 PORT 환경 변수 사용)
ENV PORT=8080
EXPOSE 8080

# 헬스체크
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/api/info', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# 애플리케이션 실행
CMD ["node", "dist/index.js"]
