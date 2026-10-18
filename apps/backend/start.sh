#!/bin/sh
set -eu

: "${DATABASE_URL:?DATABASE_URL must be configured}"
: "${JWT_SECRET:?JWT_SECRET must be configured}"

# Never reset or seed production data. Failed migrations must prevent startup.
echo "Applying database migrations..."
DATABASE_URL="${DIRECT_URL:-$DATABASE_URL}" \
  ./node_modules/.bin/prisma migrate deploy --schema=./prisma/schema.prisma

echo "Starting Issue Tracker Backend..."
exec node dist/main.js
