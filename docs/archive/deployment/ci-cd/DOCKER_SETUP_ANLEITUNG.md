> Historisches Dokument. Maßgeblich sind [Deployment](../../../deployment/README.md) und [Schnellstart](../../../QUICKSTART.md). Beispiele können veraltet sein.

# Docker Setup Anleitung für Issue Tracker

## 🐳 Docker für PostgreSQL Setup

Diese Anleitung beschreibt die Einrichtung von PostgreSQL mit Docker für die lokale Entwicklung des Issue Trackers.

## 📋 Voraussetzungen

- Docker Desktop installiert und gestartet
- Docker Compose verfügbar
- PowerShell oder Terminal mit Docker-Zugriff

## 🚀 Ausgeführte Schritte

### 1. Docker Compose Datei erstellen

**Datei**: `docker-compose.yml` (Root-Verzeichnis)

```yaml
services:
  postgres:
    image: postgres:16-alpine
    container_name: issue-tracker-postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: issue_tracker_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: 1234
      PGDATA: /var/lib/postgresql/data/pgdata
    ports:
      - '5435:5432' # Port 5435 um Konflikte zu vermeiden
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - issue-tracker-network

  # Optional: pgAdmin für Datenbank-Management
  pgadmin:
    image: dpage/pgadmin4:latest
    container_name: issue-tracker-pgadmin
    restart: unless-stopped
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@issuetracker.com
      PGADMIN_DEFAULT_PASSWORD: admin123
      PGADMIN_CONFIG_SERVER_MODE: 'False'
    ports:
      - '5050:80'
    volumes:
      - pgadmin_data:/var/lib/pgadmin
    networks:
      - issue-tracker-network
    depends_on:
      - postgres

volumes:
  postgres_data:
    driver: local
  pgadmin_data:
    driver: local

networks:
  issue-tracker-network:
    driver: bridge
```

**Besonderheiten:**

- **Port 5435**: Verwendet um Konflikte mit anderen PostgreSQL-Instanzen zu vermeiden
- **Persistent Volumes**: Daten bleiben nach Container-Neustart erhalten
- **pgAdmin**: Optional für grafische Datenbank-Verwaltung

### 2. Umgebungsvariablen konfigurieren

**Datei**: `apps/backend/.env`

```env
DATABASE_URL=postgresql://postgres:1234@localhost:5435/issue_tracker_db
PORT=3000
```

**Wichtig:**

- Keine Anführungszeichen um DATABASE_URL
- Port 5435 entsprechend Docker-Mapping
- Schema-Parameter kann weggelassen werden für einfachere Konfiguration

### 3. Prisma Schema für PostgreSQL anpassen

**Datei**: `apps/backend/prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Vollständiges Schema für Issue Tracker
model User {
  id           String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  name         String
  surname      String
  email        String   @unique
  passwordHash String   @map("password_hash")
  role         UserRole @default(REPORTER)
  createdAt    DateTime @default(now()) @map("created_at") @db.Timestamptz

  // Relations
  createdProjects     Project[]       @relation("ProjectCreator")
  reportedTickets     Ticket[]        @relation("TicketReporter")
  assignedTickets     Ticket[]        @relation("TicketAssignee")
  projectMemberships  ProjectMember[] @relation("ProjectMemberUser")
  addedMembers        ProjectMember[] @relation("ProjectMemberAdder")
  comments            Comment[]
  ticketActivities    TicketActivity[]

  @@map("users")
}

model Project {
  id          String        @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  createdBy   String        @map("created_by") @db.Uuid
  name        String
  description String
  slug        String        @unique
  status      ProjectStatus @default(OPEN)
  createdAt   DateTime      @default(now()) @map("created_at") @db.Timestamptz
  updatedAt   DateTime?     @map("updated_at") @db.Timestamptz

  // Relations
  creator Project @relation("ProjectCreator", fields: [createdBy], references: [id])
  tickets Ticket[]
  labels  Label[]
  members ProjectMember[]

  @@map("projects")
}

// Weitere Modelle: Ticket, Label, Comment, etc.
// (Vollständiges Schema siehe schema.prisma)

enum UserRole {
  REPORTER  @map("reporter")
  DEVELOPER @map("developer")
  MANAGER   @map("manager")
  ADMIN     @map("admin")
}

enum ProjectStatus {
  OPEN   @map("open")
  CLOSED @map("closed")
}

enum TicketStatus {
  OPEN        @map("open")
  IN_PROGRESS @map("in_progress")
  RESOLVED    @map("resolved")
  CLOSED      @map("closed")
}

enum TicketPriority {
  LOW      @map("low")
  MEDIUM   @map("medium")
  HIGH     @map("high")
  CRITICAL @map("critical")
}
```

### 4. Container starten

```bash
# Im Root-Verzeichnis des Projekts
docker-compose up -d
```

**Erwartete Ausgabe:**

```
[+] Running 3/3
 ✔ Network issue-tracker_issue-tracker-network  Created
 ✔ Container issue-tracker-postgres             Started
 ✔ Container issue-tracker-pgadmin              Started
```

### 5. Prisma Migration und Seeding

```bash
# Wechsle ins Backend-Verzeichnis
cd apps/backend

# Führe Prisma Migration aus
npx prisma migrate dev --name "initial-schema"

# Generiere Prisma Client
npx prisma generate

# Erstelle Test-Daten über Seed-Script
npx ts-node prisma/seed.ts
```

**Seed-Script** erstellt automatisch einen Test-User:

**Datei**: `scripts/database/seed.ts`

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres:1234@localhost:5435/issue_tracker_db',
    },
  },
});

async function main() {
  console.log('🌱 Seeding database...');

  // Erstelle einen Test-User
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      name: 'Test',
      surname: 'User',
      email: 'test@example.com',
      passwordHash: 'hashed_password_123',
      role: 'DEVELOPER',
    },
  });

  console.log('✅ Created user:', {
    id: user.id,
    name: user.name,
    surname: user.surname,
    email: user.email,
    role: user.role,
  });

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

### 6. Container Status prüfen

```bash
docker ps
```

**Erwartete Container:**

- `issue-tracker-postgres` auf Port 5435
- `issue-tracker-pgadmin` auf Port 5050

### 7. Datenbankverbindung testen

```bash
# Direkte Verbindung zur Datenbank
docker exec -it issue-tracker-postgres psql -U postgres -d issue_tracker_db -c "SELECT version();"
```

## 🔧 Troubleshooting

### Problem 1: Port-Konflikte

**Symptom:** Container startet nicht oder Port bereits belegt

**Lösung:**

```bash
# Prüfe belegte Ports
netstat -an | findstr :5432
netstat -an | findstr :5435

# Prüfe laufende PostgreSQL Container
docker ps | findstr postgres

# Verwende anderen Port in docker-compose.yml
ports:
  - "5436:5432"  # Ändere externe Port-Nummer
```

### Problem 2: Prisma Verbindungsfehler

**Symptom:** `P1000: Authentication failed`

**Häufige Ursachen:**

1. Container noch nicht vollständig gestartet
2. Falsche Umgebungsvariablen
3. Port-Konflikte

**Lösungsschritte:**

```bash
# 1. Container-Logs prüfen
docker logs issue-tracker-postgres

# 2. Warten bis Container bereit ist
docker exec -it issue-tracker-postgres pg_isready -U postgres

# 3. Direkte Datenbankverbindung testen
docker exec -it issue-tracker-postgres psql -U postgres -l

# 4. Umgebungsvariablen prüfen
cd apps/backend && cat .env
```

### Problem 3: Migrations schlagen fehl

**Lösung:**

```bash
# Alte SQLite-Migrations entfernen
cd apps/backend
Remove-Item -Path "prisma\migrations" -Recurse -Force
Remove-Item -Path "prisma\dev.db" -Force -ErrorAction SilentlyContinue

# Prisma Client neu generieren
npx prisma generate

# Neue Migration für PostgreSQL
npx prisma migrate dev --name init_postgres
```

## 🎯 Manuelle Migration (Fallback)

Falls automatische Migrations nicht funktionieren:

```bash
# 1. Schema direkt anwenden
npx prisma db push

# 2. Migration-Dateien manuell generieren
npx prisma migrate dev --create-only --name init_postgres

# 3. Migration manuell ausführen
npx prisma migrate deploy
```

## 🌐 Zugangspunkte

Nach erfolgreichem Setup:

- **PostgreSQL**: `localhost:5435`
- **pgAdmin**: `http://localhost:5050`
  - Email: `admin@issuetracker.com`
  - Password: `admin123`

## 📚 Nützliche Docker-Commands

```bash
# Container starten
docker-compose up -d

# Container stoppen
docker-compose down

# Logs anzeigen
docker logs issue-tracker-postgres
docker logs issue-tracker-pgadmin

# Container Status
docker ps
docker ps -a

# In Container einsteigen
docker exec -it issue-tracker-postgres bash
docker exec -it issue-tracker-postgres psql -U postgres

# Volumes und Netzwerke prüfen
docker volume ls
docker network ls

# Alles zurücksetzen (ACHTUNG: Löscht Daten!)
docker-compose down -v
docker volume rm issue-tracker_postgres_data
docker volume rm issue-tracker_pgadmin_data
```

## 🔄 Entwicklungsworkflow

### Vollständiges Setup (Einmalig):

```bash
# 1. Container starten
docker-compose up -d

# 2. Warten bis PostgreSQL bereit ist
Start-Sleep -Seconds 5

# 3. Backend-Verzeichnis
cd apps/backend

# 4. Prisma Migration
npx prisma migrate dev --name "initial-schema"

# 5. Prisma Client generieren
npx prisma generate

# 6. Test-Daten erstellen
npx ts-node prisma/seed.ts

# 7. Backend starten (aus Root-Verzeichnis)
cd .. && npx nx serve backend
```

### Tägliche Entwicklung:

```bash
# Container starten (falls gestoppt)
docker-compose up -d

# Backend starten
npx nx serve backend

# Verfügbare API Endpoints:
# - GET http://localhost:3000/api (Standard Response)
# - GET http://localhost:3000/api/users (Test-User abrufen)
```

### Schema-Änderungen:

```bash
# 1. Schema bearbeiten: apps/backend/prisma/schema.prisma
# 2. Migration erstellen:
cd apps/backend && npx prisma migrate dev --name "<beschreibung>"

# 3. Prisma Client neu generieren:
npx prisma generate

# 4. Backend neu starten
```

### Docker komplett zurücksetzen:

```bash
# Alle Container und Daten löschen
docker-compose down -v

# Neustart mit frischen Daten
docker-compose up -d
cd apps/backend
npx prisma migrate dev --name "initial-schema"
npx ts-node prisma/seed.ts
```

## 🛡️ Sicherheitshinweise

**Für Entwicklung:**

- Einfache Passwörter sind akzeptabel
- Container sind nur lokal erreichbar

**Für Produktion:**

- Starke Passwörter verwenden
- Umgebungsvariablen über Secrets verwalten
- Netzwerk-Isolation implementieren
- Backup-Strategien definieren

---

**Setup erstellt am:** 11. November 2025  
**Letzte Aktualisierung:** 12. November 2025  
**Docker Version:** Desktop 4.x  
**PostgreSQL Version:** 16.10 Alpine  
**pgAdmin Version:** Latest  
**Prisma Version:** 5.11.0

**Status:** ✅ Produktionsbereit mit Minimalkonfiguration
