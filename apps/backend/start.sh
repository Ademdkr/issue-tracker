#!/bin/sh
set -e

echo "========================================="
echo "Starting Issue Tracker Backend"
echo "========================================="

# Debug: Print DATABASE_URL (without password)
echo "DATABASE_URL check:"
echo "$DATABASE_URL" | sed 's/:\/\/[^:]*:[^@]*@/:\/\/***:***@/'

# Ensure Prisma CLI is available
echo "Installing Prisma CLI..."
npm install prisma@5.22.0 --no-save --legacy-peer-deps

# Remove any existing Prisma Client
echo "Removing old Prisma Client..."
rm -rf node_modules/.prisma node_modules/@prisma/client

# Generate fresh Prisma Client with production DATABASE_URL
echo "Generating Prisma Client with production DATABASE_URL..."
npx prisma generate --schema=./prisma/schema.prisma

echo "Starting NestJS application..."
node dist/main.js
