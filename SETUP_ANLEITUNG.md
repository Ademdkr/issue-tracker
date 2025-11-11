# Issue Tracker Monorepo - Setup Anleitung

## 📋 Überblick
Dieses Dokument beschreibt die Schritte zum Erstellen eines Monorepos mit Nx Dev Tools, das ein NestJS Backend und ein Angular Frontend enthält.

## 🚀 Ausgeführte Schritte

### 1. Nx Workspace Erstellen
```bash
# Navigiere zum gewünschten Verzeichnis
cd "c:\Users\Adem\Desktop\Dev\TypeScript"

# Erstelle neues Nx Workspace mit NestJS Preset
npx create-nx-workspace@latest issue-tracker --preset=nest --interactive=false
```

**Ergebnis:** Ein neues Nx Workspace mit einer vorkonfigurierten NestJS-Anwendung wurde erstellt.

### 2. In das Workspace-Verzeichnis wechseln
```bash
cd issue-tracker
```

### 3. Backend-App umbenennen
```bash
# Benenne die automatisch generierte App in "backend" um
mv apps\issue-tracker apps\backend
mv apps\issue-tracker-e2e apps\backend-e2e
```

**Wichtig:** Die Konfigurationsdateien müssen angepasst werden:

#### 3.1 Backend project.json aktualisieren
Datei: `apps/backend/project.json`
- `name`: von "issue-tracker" zu "backend"
- `sourceRoot`: von "apps/issue-tracker/src" zu "apps/backend/src" 
- Alle Pfade in den targets entsprechend anpassen

#### 3.2 Backend E2E project.json aktualisieren  
Datei: `apps/backend-e2e/project.json`
- `name`: von "issue-tracker-e2e" zu "backend-e2e"
- `implicitDependencies`: von ["issue-tracker"] zu ["backend"]
- Jest config Pfad anpassen

### 4. Angular Plugin installieren
```bash
npm install --save-dev @nx/angular
```

### 5. Angular Frontend generieren
```bash
npx nx g @nx/angular:app frontend
```

**Konfiguration bei der Generierung:**
- Stylesheet format: `scss`
- Unit test runner: `jest`
- E2E test runner: `cypress`
- Bundler: `esbuild`
- Server-Side Rendering (SSR): `false`

### 6. Dependency-Konflikt beheben
```bash
npm install --legacy-peer-deps
```

### 7. Frontend-Apps in das apps-Verzeichnis verschieben
```bash
mv frontend apps\frontend
mv frontend-e2e apps\frontend-e2e
```

### 8. Frontend-Konfigurationen anpassen
#### 8.1 Frontend project.json aktualisieren
Datei: `apps/frontend/project.json`
- `$schema`: von "../node_modules/nx/schemas/project-schema.json" zu "../../node_modules/nx/schemas/project-schema.json"
- `sourceRoot`: von "frontend/src" zu "apps/frontend/src"
- Alle Build-Pfade entsprechend anpassen

#### 8.2 Frontend tsconfig.json anpassen
Datei: `apps/frontend/tsconfig.json`
- `extends`: von "../tsconfig.base.json" zu "../../tsconfig.base.json"

#### 8.3 Frontend E2E project.json anpassen
Datei: `apps/frontend-e2e/project.json`
- `$schema` und `sourceRoot` Pfade entsprechend aktualisieren

## 🏗️ Finale Projekt-Struktur

```
issue-tracker/
├── apps/
│   ├── backend/                 # NestJS Backend-Anwendung
│   │   ├── src/
│   │   ├── project.json
│   │   └── ...
│   ├── backend-e2e/            # Backend E2E Tests
│   ├── frontend/               # Angular Frontend-Anwendung  
│   │   ├── src/
│   │   ├── project.json
│   │   └── ...
│   └── frontend-e2e/           # Frontend E2E Tests (Cypress)
├── dist/                       # Build-Ausgabeverzeichnis
├── node_modules/
├── nx.json                     # Nx Workspace-Konfiguration
├── package.json
├── tsconfig.base.json
└── README.md
```

## ✅ Validierung

### Build-Tests
```bash
# Backend bauen
npx nx build backend

# Frontend bauen  
npx nx build frontend
```

### Projekte anzeigen
```bash
# Alle Projekte im Workspace auflisten
npx nx show projects
```

**Erwartete Ausgabe:**
```
frontend-e2e
backend-e2e  
frontend
backend
```

## 🎯 Nächste Schritte

1. **Backend entwickeln:**
   ```bash
   npx nx serve backend
   ```

2. **Frontend entwickeln:**
   ```bash  
   npx nx serve frontend
   ```

3. **Tests ausführen:**
   ```bash
   # Unit Tests
   npx nx test backend
   npx nx test frontend
   
   # E2E Tests
   npx nx e2e backend-e2e
   npx nx e2e frontend-e2e
   ```

4. **Dependency Graph anzeigen:**
   ```bash
   npx nx graph
   ```

## �️ Prisma Datenbank Setup

### 1. Prisma Dependencies installieren
```bash
# Im Root-Verzeichnis des Projekts
cd "c:\Users\Adem\Desktop\Dev\TypeScript\issue-tracker"
npm install prisma @prisma/client dotenv --legacy-peer-deps
```

**Hinweis:** `--legacy-peer-deps` ist erforderlich aufgrund von Dependency-Konflikten mit jest-preset-angular.

### 2. Prisma im Backend initialisieren
```bash
# In den Backend-Ordner wechseln
cd apps\backend

# Prisma initialisieren
npx prisma init
```

**Ergebnis:** 
- `prisma/schema.prisma` - Datenbankschema-Datei erstellt
- `prisma.config.ts` - Prisma-Konfigurationsdatei erstellt
- `.env` - Umgebungsvariablen-Datei erstellt

### 3. Prisma-Konfiguration anpassen

#### 3.1 prisma.config.ts vereinfachen
Die automatisch generierte `prisma.config.ts` entfernen:
```bash
del prisma.config.ts
```

#### 3.2 Schema für SQLite anpassen
Datei: `apps/backend/prisma/schema.prisma`
```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}

model Issue {
  id          String   @id @default(cuid())
  title       String
  description String?
  status      Status   @default(OPEN)
  priority    Priority @default(MEDIUM)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("issues")
}

enum Status {
  OPEN
  IN_PROGRESS
  CLOSED
}

enum Priority {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}
```

### 4. Prisma Client generieren
```bash
cd apps\backend
npx prisma generate
```

**Ergebnis:** Prisma Client wird in `node_modules/@prisma/client` generiert.

### 5. Datenbank-Migration erstellen
```bash
npx prisma migrate dev --name init
```

**Ergebnis:**
- SQLite-Datenbank `dev.db` wird erstellt
- Migration-Ordner `prisma/migrations/20251111130405_init/` wird erstellt
- Migration wird automatisch angewendet

### 6. NestJS Services erstellen

#### 6.1 PrismaService erstellen
Datei: `apps/backend/src/app/prisma.service.ts`
```typescript
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

#### 6.2 IssuesService erstellen
Datei: `apps/backend/src/app/issues.service.ts`
```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { Status, Priority } from '@prisma/client';

@Injectable()
export class IssuesService {
  constructor(private prisma: PrismaService) {}

  async createIssue(data: { title: string; description?: string }) {
    return this.prisma.issue.create({
      data: {
        title: data.title,
        description: data.description,
      },
    });
  }

  async findAllIssues() {
    return this.prisma.issue.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findIssueById(id: string) {
    return this.prisma.issue.findUnique({
      where: { id },
    });
  }

  async updateIssue(id: string, data: { title?: string; description?: string; status?: Status; priority?: Priority }) {
    return this.prisma.issue.update({
      where: { id },
      data,
    });
  }

  async deleteIssue(id: string) {
    return this.prisma.issue.delete({
      where: { id },
    });
  }
}
```

#### 6.3 AppModule aktualisieren
Datei: `apps/backend/src/app/app.module.ts`
```typescript
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { IssuesService } from './issues.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, PrismaService, IssuesService],
})
export class AppModule {}
```

### 7. Backend-Service testen
```bash
# Vom Root-Verzeichnis aus
npx nx serve backend
```

**Erwartete Ausgabe:**
```
🚀 Application is running on: http://localhost:3000/api
```

### 8. Prisma-Dateistruktur Übersicht

Nach der Installation sieht die Struktur folgendermaßen aus:

```
apps/backend/
├── prisma/
│   ├── migrations/
│   │   └── 20251111130405_init/
│   │       └── migration.sql
│   ├── dev.db                 # SQLite-Datenbank
│   └── schema.prisma          # Datenbankschema
├── src/app/
│   ├── app.module.ts          # Aktualisiert mit Prisma Services
│   ├── prisma.service.ts      # Datenbankverbindung
│   ├── issues.service.ts      # CRUD-Operationen für Issues
│   └── ...
├── .env                       # Umgebungsvariablen (automatisch erstellt)
└── ...
```

## 🔧 Nützliche Prisma-Commands

| Command | Beschreibung |
|---------|--------------|
| `npx prisma generate` | Generiert den Prisma Client |
| `npx prisma migrate dev` | Erstellt und wendet Migrations an |
| `npx prisma migrate reset` | Setzt die Datenbank zurück |
| `npx prisma studio` | Öffnet Prisma Studio (GUI) |
| `npx prisma db push` | Wendet Schema-Änderungen ohne Migration an |
| `npx prisma db seed` | Führt Seed-Scripts aus |

## �🔧 Nützliche Nx-Commands

| Command | Beschreibung |
|---------|--------------|
| `npx nx build <app>` | Baut eine spezifische App |
| `npx nx serve <app>` | Startet eine App im Entwicklungsmodus |
| `npx nx test <app>` | Führt Unit-Tests aus |
| `npx nx e2e <app>-e2e` | Führt E2E-Tests aus |
| `npx nx lint <app>` | Führt Linting aus |
| `npx nx format` | Formatiert den Code |
| `npx nx show projects` | Zeigt alle Projekte an |
| `npx nx graph` | Öffnet den Dependency-Graph |

## 📚 Weitere Ressourcen

- [Nx Documentation](https://nx.dev/)
- [NestJS Documentation](https://nestjs.com/)
- [Angular Documentation](https://angular.io/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Prisma NestJS Guide](https://www.prisma.io/docs/guides/other/using-prisma-with-nestjs)

## 🚀 Entwicklungsworkflow

### Backend-Entwicklung mit Prisma
1. **Schema ändern:** Datenbankmodelle in `schema.prisma` anpassen
2. **Migration erstellen:** `npx prisma migrate dev --name <migration-name>`
3. **Client regenerieren:** `npx prisma generate` (automatisch bei Migration)
4. **Services aktualisieren:** TypeScript-Code entsprechend anpassen
5. **Testen:** Backend mit `npx nx serve backend` starten

### Troubleshooting

#### Häufige Probleme und Lösungen

**Problem:** Dependency-Konflikt bei npm install
```bash
# Lösung: Legacy peer deps verwenden
npm install --legacy-peer-deps
```

**Problem:** Prisma Client nicht gefunden
```bash
# Lösung: Client neu generieren
npx prisma generate
```

**Problem:** Migration schlägt fehl
```bash
# Lösung: Datenbank zurücksetzen (nur in Entwicklung!)
npx prisma migrate reset
```

**Problem:** "Pfad nicht gefunden" bei prisma dev
```bash
# Lösung: SQLite statt Postgres verwenden oder lokalen PostgreSQL-Server installieren
```

---

**Setup erstellt am:** 11. November 2025  
**Nx Version:** 22.0.3  
**Prisma Version:** 6.19.0  
**Node.js:** Aktuelle LTS-Version empfohlen