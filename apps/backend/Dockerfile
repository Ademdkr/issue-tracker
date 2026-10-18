# Multi-stage Dockerfile - Clean separation of build and runtime

# ============================================
# Stage 1: Dependencies
# ============================================
FROM node:20-alpine AS dependencies
WORKDIR /app

RUN apk add --no-cache python3 make g++ openssl

COPY package*.json ./
COPY nx.json tsconfig.base.json ./

RUN npm ci --legacy-peer-deps

# ============================================
# Stage 2: Build
# ============================================
FROM dependencies AS build
WORKDIR /app

# Copy source (NO .env files due to .dockerignore)
COPY eslint.config.mjs ./
COPY apps/eslint.config.mjs ./apps/eslint.config.mjs
COPY apps/backend ./apps/backend
COPY libs ./libs

# Generate Prisma Client for TypeScript compilation ONLY
# Using placeholder URL - will NOT be used in production
RUN cd apps/backend && \
  DATABASE_URL="postgresql://build:build@localhost:5432/build" \
  npx prisma generate --generator client

# Build application
RUN NX_DAEMON=false npx nx build backend --configuration=production

# ============================================
# Stage 3: Production Runtime
# ============================================
FROM node:20-alpine AS production
WORKDIR /app

RUN apk add --no-cache openssl curl

# Production dependencies only
COPY package*.json ./
RUN npm ci --only=production --legacy-peer-deps && \
  npm cache clean --force && \
  rm -rf node_modules/.prisma node_modules/@prisma/client/.prisma

# Copy compiled app
COPY --from=build /app/dist/apps/backend ./dist
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma

# Copy Prisma files
COPY apps/backend/prisma ./prisma
COPY apps/backend/start.sh ./start.sh

# Create non-root user
RUN addgroup -g 1001 nodejs && \
  adduser -S -u 1001 -G nodejs nestjs && \
  chown nestjs:nodejs /app

USER nestjs

ENV NODE_ENV=production \
  NODE_OPTIONS="--max-old-space-size=512" \
  PORT=3000

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl --fail --silent --max-time 5 "http://localhost:${PORT:-3000}/api/health/ready" || exit 1

# Use the client generated for this image; migrate before accepting traffic.
CMD ["sh", "./start.sh"]
