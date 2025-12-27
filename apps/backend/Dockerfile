# Backend Dockerfile
# Multi-stage build for optimized production image

# Stage 1: Base - Install dependencies
FROM node:20-alpine AS base
WORKDIR /app

# Install required build tools
RUN apk add --no-cache libc6-compat python3 make g++

# Copy package files
COPY package*.json ./
COPY nx.json ./
COPY tsconfig.base.json ./

# Stage 2: Dependencies - Install all dependencies
FROM base AS dependencies
WORKDIR /app

# Install all dependencies (including dev dependencies for build)
RUN npm ci --legacy-peer-deps

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
FROM node:20-alpine AS production
WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Install production dependencies only
COPY package*.json ./
RUN npm ci --only=production --legacy-peer-deps && npm cache clean --force

# Copy built application from build stage
COPY --from=build --chown=nestjs:nodejs /app/dist/apps/backend ./dist
COPY --from=build --chown=nestjs:nodejs /app/apps/backend/prisma ./prisma
COPY --from=build --chown=nestjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma

# Copy Prisma schema for migrations
COPY --chown=nestjs:nodejs apps/backend/prisma/schema.prisma ./prisma/

# Switch to non-root user
USER nestjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["node", "dist/main.js"]
