#!/bin/sh
set -e

echo "========================================="
echo "Starting Issue Tracker Backend"
echo "========================================="

# Debug: Print DATABASE_URL (without password)
echo "DATABASE_URL check:"
echo "$DATABASE_URL" | sed 's/:\/\/[^:]*:[^@]*@/:\/\/***:***@/'

# Generate Prisma Client with production DATABASE_URL
echo "Generating Prisma Client..."
npx prisma generate --schema=./prisma/schema.prisma --generator client

echo "Starting NestJS application..."
node dist/main.js
