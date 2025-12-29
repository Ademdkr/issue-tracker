# Frontend Dockerfile - Optimized for Render Production Deployment
# Multi-stage build for minimal image size with Nginx

# Stage 1: Base - Install dependencies
FROM node:20.19.0-alpine3.20 AS base
WORKDIR /app

# Install security updates and required build tools
RUN apk update && \
  apk upgrade && \
  apk add --no-cache \
  libc6-compat \
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

# Install all dependencies
RUN npm ci --legacy-peer-deps --prefer-offline --no-audit

# Stage 3: Build - Build the Angular application
FROM dependencies AS build
WORKDIR /app

# Copy source code
COPY apps/frontend ./apps/frontend
COPY libs ./libs

# Build frontend for production
RUN npx nx build frontend --configuration=production

# Stage 4: Production - Nginx server
FROM nginx:1.27-alpine AS production

# Install security updates and runtime dependencies
RUN apk update && \
  apk upgrade && \
  apk add --no-cache \
  curl \
  dumb-init && \
  rm -rf /var/cache/apk/*

# Copy custom nginx configuration
COPY apps/frontend/nginx.conf /etc/nginx/nginx.conf

# Copy built Angular app from build stage
COPY --from=build /app/dist/apps/frontend/browser /usr/share/nginx/html

# Create non-root user and set permissions
RUN addgroup -g 101 -S nginx || true && \
  adduser -S -D -H -u 101 -h /var/cache/nginx -s /sbin/nologin -G nginx -g nginx nginx || true && \
  chown -R nginx:nginx /usr/share/nginx/html && \
  chown -R nginx:nginx /var/cache/nginx && \
  chown -R nginx:nginx /var/log/nginx && \
  chmod -R 755 /usr/share/nginx/html && \
  mkdir -p /var/run && \
  touch /var/run/nginx.pid && \
  chown -R nginx:nginx /var/run/nginx.pid

# Switch to non-root user
USER nginx

# Set production environment
ENV NODE_ENV=production

# Expose port 8080 (Render uses 10000 by default, but configurable)
EXPOSE 8080

# Health check optimized for Render
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["/usr/bin/dumb-init", "--"]

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
