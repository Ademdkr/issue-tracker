# Datenbank Seed & Export

Dieses Verzeichnis enthält Skripte zum Exportieren und Importieren des Datenbankbestands.

## 🔄 Workflow

### 1. Aktuellen Datenbestand exportieren

Exportiert den kompletten Datenbestand aus der Datenbank in eine JSON-Datei:

```powershell
$env:DATABASE_URL = "postgresql://postgres:1234@localhost:5435/issue_tracker_db"
npx tsx apps/backend/prisma/export-current-data.ts
```

Dies erstellt die Datei `apps/backend/prisma/seed-data.json` mit allen:
- Users (mit gehashten Passwörtern)
- Projects
- Project Members
- Labels
- Tickets
- Ticket Labels
- Comments
- Ticket Activities

### 2. Datenbestand importieren

Importiert die Daten aus `seed-data.json` zurück in die Datenbank:

```powershell
$env:DATABASE_URL = "postgresql://postgres:1234@localhost:5435/issue_tracker_db"
npx tsx apps/backend/prisma/import-seed-data.ts
```

**Wichtig:** Dieses Skript löscht ALLE bestehenden Daten und ersetzt sie durch die importierten Daten!

Falls `seed-data.json` nicht existiert, werden Standard-Testdaten angelegt.

## 📁 Dateien

- **`export-current-data.ts`** - Exportiert aktuellen Datenbestand
- **`import-seed-data.ts`** - Importiert Daten aus seed-data.json
- **`seed-data.json`** - Exportierte Daten (wird durch export-current-data.ts erstellt)
- **`seed.ts`** - Legacy Seed-Skript (wird durch import-seed-data.ts ersetzt)
- **`seed-tickets.ts`** - Skript zum Hinzufügen von Beispiel-Tickets

## 💡 Anwendungsfälle

### Entwicklung
```powershell
# 1. Datenbank mit Testdaten füllen
npx tsx apps/backend/prisma/import-seed-data.ts

# 2. Entwicklung & Testing...

# 3. Aktuellen Stand exportieren
npx tsx apps/backend/prisma/export-current-data.ts
```

### Deployment Vorbereitung
```powershell
# 1. Exportiere finalen Datenbestand für Portfolio
npx tsx apps/backend/prisma/export-current-data.ts

# 2. seed-data.json ins Git committen
git add apps/backend/prisma/seed-data.json
git commit -m "chore: Update seed data for deployment"

# 3. Im Production Environment importieren
npx tsx apps/backend/prisma/import-seed-data.ts
```

### Datenbank zurücksetzen
```powershell
# Setzt Datenbank auf letzten exportierten Stand zurück
npx tsx apps/backend/prisma/import-seed-data.ts
```

## 🔐 Passwörter

Die exportierten User-Daten enthalten bcrypt-gehashte Passwörter. Beim Import werden diese Hashes beibehalten, sodass die Login-Credentials gleich bleiben.

**Standard-Testdaten Credentials:**
- `admin@example.com` → `Admin123!`
- `manager@example.com` → `Manager123!`
- `developer@example.com` → `Developer123!`
- `reporter@example.com` → `Reporter123!`

## ⚠️ Wichtige Hinweise

1. **Backup:** Erstelle immer ein Backup vor dem Import!
2. **Foreign Keys:** Die Skripte beachten die richtige Reihenfolge für Foreign Key Constraints
3. **IDs:** Alle IDs (UUIDs) werden beibehalten beim Export/Import
4. **Timestamps:** `createdAt` und `updatedAt` werden beibehalten
5. **seed-data.json:** Diese Datei sollte ins Git committed werden für reproduzierbare Seeds

## 🚀 Schnellstart

```powershell
# Umgebungsvariable setzen
$env:DATABASE_URL = "postgresql://postgres:1234@localhost:5435/issue_tracker_db"

# Aktuellen Stand exportieren
npx tsx apps/backend/prisma/export-current-data.ts

# Datenbank zurücksetzen und importieren
npx tsx apps/backend/prisma/import-seed-data.ts
```
