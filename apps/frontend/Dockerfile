# Frontend Dockerfile
# Multi-stage build for optimized production image with Nginx

# Stage 1: Base - Install dependencies
FROM node:20-alpine AS base
WORKDIR /app

# Install required build tools
RUN apk add --no-cache libc6-compat

# Copy package files
COPY package*.json ./
COPY nx.json ./
COPY tsconfig.base.json ./

# Stage 2: Dependencies - Install all dependencies
FROM base AS dependencies
WORKDIR /app

# Install all dependencies
RUN npm ci --legacy-peer-deps

# Stage 3: Build - Build the Angular application
FROM dependencies AS build
WORKDIR /app

# Copy source code
COPY apps/frontend ./apps/frontend
COPY libs ./libs

# Build frontend for production
RUN npx nx build frontend --configuration=production

# Stage 4: Production - Nginx server
FROM nginx:alpine AS production

# Copy custom nginx configuration
COPY apps/frontend/nginx.conf /etc/nginx/nginx.conf

# Copy built Angular app from build stage
COPY --from=build /app/dist/apps/frontend/browser /usr/share/nginx/html

# Create non-root user
RUN addgroup -g 1001 -S nginx && \
    adduser -S angular -u 1001 -G nginx && \
    chown -R angular:nginx /usr/share/nginx/html && \
    chown -R angular:nginx /var/cache/nginx && \
    chown -R angular:nginx /var/log/nginx && \
    chown -R angular:nginx /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R angular:nginx /var/run/nginx.pid

# Switch to non-root user
USER angular

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/health || exit 1

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
