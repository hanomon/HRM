# Backend Dockerfile for Google Cloud Run
# Multi-stage build: build stage -> production stage

# ---- Build Stage ----
FROM node:18-alpine AS builder

WORKDIR /app

# package.json 복사 (lock 파일 없어도 동작)
COPY package*.json ./

# devDependencies 포함 전체 설치 (TypeScript 빌드에 필요)
RUN npm install --include=dev

# 소스 코드 복사
COPY . .

# TypeScript 빌드
RUN npm run build

# ---- Production Stage ----
FROM node:18-alpine AS runner

WORKDIR /app

# package.json 복사
COPY package*.json ./

# 프로덕션 의존성만 설치
RUN npm install --omit=dev

# 빌드 결과물만 복사
COPY --from=builder /app/dist ./dist

# 프로덕션 환경 설정
ENV NODE_ENV=production

# 포트 설정 (Cloud Run은 PORT 환경 변수 사용)
ENV PORT=8080
EXPOSE 8080

# 헬스체크
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:' + process.env.PORT + '/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# 애플리케이션 실행
CMD ["node", "dist/index.js"]
