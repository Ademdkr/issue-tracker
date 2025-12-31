# 🛠️ Development Scripts

Automatisierte Setup-Scripts für schnellen Entwicklungsstart.

## 📝 Verfügbare Scripts

### `dev-setup.ps1` (Windows PowerShell)

Vollautomatischer Setup für lokale Entwicklung:
- Startet PostgreSQL im Docker
- Erstellt .env Datei (falls nicht vorhanden)
- Generiert Prisma Client
- Führt Migrationen aus
- Seeded Datenbank mit Test-Daten

**Verwendung:**
```powershell
.\scripts\dev-setup.ps1
```

### `dev-setup.sh` (Linux/macOS Bash)

Identische Funktionalität wie PowerShell-Version.

**Verwendung:**
```bash
chmod +x scripts/dev-setup.sh
./scripts/dev-setup.sh
```

---

## ⚠️ Voraussetzungen

- Docker Desktop muss installiert und **gestartet** sein
- Node.js 20.x installiert
- `npm install` bereits ausgeführt

---

## 🚀 Nach dem Setup

Das Script bereitet alles vor. Danach:

**Terminal 1:**
```bash
npx nx serve backend
```

**Terminal 2:**
```bash
npx nx serve frontend
```

---

## 🌐 Zugriff

- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:3000/api
- **Swagger Docs**: http://localhost:3000/api/docs
- **pgAdmin**: http://localhost:5050 (Email: `admin@issuetracker.local`, Passwort: `admin123`)

---

## 👤 Test-Accounts

| Email | Passwort | Rolle |
|-------|----------|-------|
| admin@example.com | Admin123! | Admin |
| manager@example.com | Manager123! | Manager |
| developer@example.com | Developer123! | Developer |
| reporter@example.com | Reporter123! | Reporter |

---

## 🐛 Troubleshooting

**Docker nicht erreichbar:**
```powershell
# Windows: Docker Desktop starten
Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"

# Warten bis "running", dann erneut ausführen
```

**Port bereits belegt:**
```bash
# PostgreSQL Port 5435 prüfen
netstat -ano | findstr :5435

# Prozess beenden oder anderen Port in .env setzen
```

**Prisma Fehler:**
```bash
# Prisma Client manuell neu generieren
npx prisma generate --schema=apps/backend/prisma/schema.prisma

# Datenbank zurücksetzen (ACHTUNG: Löscht alle Daten!)
npx prisma migrate reset --schema=apps/backend/prisma/schema.prisma
```
