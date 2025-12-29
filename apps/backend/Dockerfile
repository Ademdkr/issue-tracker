# Backend Dockerfile - Optimized for Render Production Deployment
# Multi-stage build for minimal image size and maximum security

# Stage 1: Base - Install dependencies
FROM node:20.11.0-alpine3.19 AS base
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

# Copy source code
COPY apps/backend ./apps/backend
COPY libs ./libs

# Generate Prisma Client
RUN npx prisma generate --schema=./apps/backend/prisma/schema.prisma

# Build backend
RUN npx nx build backend --configuration=production

# Stage 4: Production - Final lightweight image
FROM node:20.11.0-alpine3.19 AS production
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

# Install production dependencies only
COPY package*.json ./
RUN npm ci --only=production --legacy-peer-deps --prefer-offline --no-audit && \
  npm cache clean --force

# Copy built application from build stage
COPY --from=build --chown=nestjs:nodejs /app/dist/apps/backend ./dist
COPY --from=build --chown=nestjs:nodejs /app/apps/backend/prisma ./prisma
COPY --from=build --chown=nestjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build --chown=nestjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma

# Copy Prisma schema for migrations
COPY --chown=nestjs:nodejs apps/backend/prisma/schema.prisma ./prisma/
COPY --chown=nestjs:nodejs apps/backend/prisma/migrations ./prisma/migrations

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

# Health check optimized for Render
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["node", "dist/main.js"]
