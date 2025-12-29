# Backend Dockerfile - Optimized for Render Production Deployment
# Multi-stage build for minimal image size and maximum security

# Stage 1: Base - Install dependencies
FROM node:20.19.0-alpine3.20 AS base
WORKDIR /app

# Install security updates and required build tools
RUN apk update && \
  apk upgrade && \
  apk add --no-cache \
  libc6-compat \
  python3 \
  make \
  g++ \
  openssl \
  curl && \
  rm -rf /var/cache/apk/*

# Copy package files
COPY package*.json ./
COPY nx.json ./
COPY tsconfig.base.json ./

# Stage 2: Dependencies - Install all dependencies
FROM base AS dependencies
WORKDIR /app

# Copy package files from base
COPY package*.json ./
COPY nx.json ./
COPY tsconfig.base.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci --legacy-peer-deps --prefer-offline --no-audit

# Stage 3: Build - Build the backend application
FROM dependencies AS build
WORKDIR /app

# Copy source code (exclude .env files)
COPY apps/backend/src ./apps/backend/src
COPY apps/backend/prisma ./apps/backend/prisma
COPY apps/backend/*.json ./apps/backend/
COPY apps/backend/*.js ./apps/backend/
COPY apps/backend/*.mjs ./apps/backend/
COPY apps/backend/start.sh ./apps/backend/
COPY libs ./libs

# Create docs directory for Prisma ERD generator
RUN mkdir -p docs/architecture

# Generate Prisma Client with dummy DATABASE_URL (will be overwritten at runtime)
# This is needed for TypeScript compilation only
RUN DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" \
    npx prisma generate --schema=./apps/backend/prisma/schema.prisma --generator client

# Build backend
RUN npx nx build backend --configuration=production

# Stage 4: Production - Final lightweight image
FROM node:20.19.0-alpine3.20 AS production
WORKDIR /app

# Install security updates and runtime dependencies
RUN apk update && \
  apk upgrade && \
  apk add --no-cache \
  openssl \
  dumb-init \
  curl && \
  rm -rf /var/cache/apk/*

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
  adduser -S nestjs -u 1001 -G nodejs

# Install production dependencies (WITHOUT Prisma Client)
COPY package*.json ./
RUN npm ci --only=production --legacy-peer-deps --prefer-offline --no-audit && \
  npm cache clean --force && \
  rm -rf node_modules/.prisma

# Copy built application from build stage
COPY --from=build --chown=nestjs:nodejs /app/dist/apps/backend ./dist

# Copy Prisma schema and migrations (NOT the generated client)
COPY --chown=nestjs:nodejs apps/backend/prisma/schema.prisma ./prisma/
COPY --chown=nestjs:nodejs apps/backend/prisma/migrations ./prisma/migrations

# Copy startup script
COPY --chown=nestjs:nodejs apps/backend/start.sh ./start.sh
RUN chmod +x ./start.sh

# Set proper permissions
RUN chown -R nestjs:nodejs /app

# Switch to non-root user
USER nestjs

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
