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
COPY apps/backend ./apps/backend
COPY libs ./libs

# Generate Prisma Client for TypeScript compilation ONLY
# Using placeholder URL - will NOT be used in production
RUN cd apps/backend && \
    DATABASE_URL="postgresql://build:build@localhost:5432/build" \
    npx prisma generate

# Build application
RUN npx nx build backend --configuration=production

# ============================================
# Stage 3: Production Runtime
# ============================================
FROM node:20-alpine AS production
WORKDIR /app

RUN apk add --no-cache openssl curl

# Production dependencies only
COPY package*.json ./
RUN npm ci --only=production --legacy-peer-deps && \
    npm cache clean --force

# Copy compiled app
COPY --from=build /app/dist/apps/backend ./dist

# Copy Prisma files
COPY apps/backend/prisma ./prisma

# Create non-root user
RUN addgroup -g 1001 nodejs && \
    adduser -S -u 1001 -G nodejs nestjs && \
    chown -R nestjs:nodejs /app

USER nestjs

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Simple startup: Generate Prisma Client, then run app
CMD npx prisma generate && node dist/main.js

# Set production environment variables
ENV NODE_ENV=production \
  NODE_OPTIONS="--max-old-space-size=512" \
  PORT=3000

# Expose port (Render uses PORT env variable)
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application with startup script
CMD ["sh", "./start.sh"]
