# Issue Tracker - Lokale Entwicklung Starter Script (PowerShell)
# Voraussetzung: Docker Desktop muss laufen

$ErrorActionPreference = "Stop"

Write-Host "🚀 Issue Tracker - Lokale Entwicklung Setup" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Prüfe ob Docker läuft
try {
    docker info | Out-Null
    Write-Host "✅ Docker Desktop läuft" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker Desktop ist nicht gestartet!" -ForegroundColor Red
    Write-Host "👉 Bitte Docker Desktop starten und dann erneut ausführen" -ForegroundColor Yellow
    exit 1
}
Write-Host ""

# Starte PostgreSQL
Write-Host "📦 Starte PostgreSQL Container..." -ForegroundColor Yellow
docker compose --project-directory . -f docker/docker-compose.dev.yml up -d
Write-Host ""

# Warte auf PostgreSQL
Write-Host "⏳ Warte auf PostgreSQL..." -ForegroundColor Yellow
Start-Sleep -Seconds 5
Write-Host ""

# Prüfe ob .env existiert
if (-not (Test-Path .env)) {
    Write-Host "📝 Erstelle .env Datei..." -ForegroundColor Yellow
    Copy-Item config/env/development.env.example .env
    Write-Host "✅ .env erstellt" -ForegroundColor Green
} else {
    Write-Host "✅ .env existiert bereits" -ForegroundColor Green
}
Write-Host ""

# Prisma Setup
Write-Host "🔧 Prisma Setup..." -ForegroundColor Yellow
npx prisma generate --schema=apps/backend/prisma/schema.prisma
Write-Host ""

Write-Host "📊 Führe Migrationen aus..." -ForegroundColor Yellow
npx prisma migrate dev --schema=apps/backend/prisma/schema.prisma
Write-Host ""

Write-Host "🌱 Datenbank seeden..." -ForegroundColor Yellow
npm run db:seed
Write-Host ""

Write-Host "✅ Setup abgeschlossen!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Nächste Schritte:" -ForegroundColor Cyan
Write-Host "   Terminal 1: npx nx serve backend" -ForegroundColor White
Write-Host "   Terminal 2: npx nx serve frontend" -ForegroundColor White
Write-Host ""
Write-Host "🌐 Zugriff:" -ForegroundColor Cyan
Write-Host "   Frontend:  http://localhost:4200" -ForegroundColor White
Write-Host "   Backend:   http://localhost:3000/api" -ForegroundColor White
Write-Host "   Swagger:   http://localhost:3000/api/docs" -ForegroundColor White
Write-Host "   pgAdmin:   http://localhost:5050" -ForegroundColor White
Write-Host ""
Write-Host "👤 Test-Accounts:" -ForegroundColor Cyan
Write-Host "   admin@example.com     / Admin123!" -ForegroundColor White
Write-Host "   manager@example.com   / Manager123!" -ForegroundColor White
Write-Host "   developer@example.com / Developer123!" -ForegroundColor White
Write-Host "   reporter@example.com  / Reporter123!" -ForegroundColor White
