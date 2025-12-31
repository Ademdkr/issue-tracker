#!/bin/bash

# Issue Tracker - Lokale Entwicklung Starter Script
# Voraussetzung: Docker Desktop muss laufen

set -e

echo "🚀 Issue Tracker - Lokale Entwicklung Setup"
echo "=========================================="
echo ""

# Prüfe ob Docker läuft
if ! docker info > /dev/null 2>&1; then
  echo "❌ Docker Desktop ist nicht gestartet!"
  echo "👉 Bitte Docker Desktop starten und dann erneut ausführen"
  exit 1
fi

echo "✅ Docker Desktop läuft"
echo ""

# Starte PostgreSQL
echo "📦 Starte PostgreSQL Container..."
docker-compose -f docker-compose.dev.yml up -d
echo ""

# Warte auf PostgreSQL
echo "⏳ Warte auf PostgreSQL..."
sleep 5
echo ""

# Prüfe ob .env existiert
if [ ! -f .env ]; then
  echo "📝 Erstelle .env Datei..."
  cp .env.local .env
  echo "✅ .env erstellt"
else
  echo "✅ .env existiert bereits"
fi
echo ""

# Prisma Setup
echo "🔧 Prisma Setup..."
npx prisma generate --schema=apps/backend/prisma/schema.prisma
echo ""

echo "📊 Führe Migrationen aus..."
npx prisma migrate dev --schema=apps/backend/prisma/schema.prisma
echo ""

echo "🌱 Datenbank seeden..."
cd apps/backend
npx ts-node prisma/seed.ts
cd ../..
echo ""

echo "✅ Setup abgeschlossen!"
echo ""
echo "📋 Nächste Schritte:"
echo "   Terminal 1: npx nx serve backend"
echo "   Terminal 2: npx nx serve frontend"
echo ""
echo "🌐 Zugriff:"
echo "   Frontend:  http://localhost:4200"
echo "   Backend:   http://localhost:3000/api"
echo "   Swagger:   http://localhost:3000/api/docs"
echo "   pgAdmin:   http://localhost:5050"
echo ""
echo "👤 Test-Accounts:"
echo "   admin@example.com     / Admin123!"
echo "   manager@example.com   / Manager123!"
echo "   developer@example.com / Developer123!"
echo "   reporter@example.com  / Reporter123!"
