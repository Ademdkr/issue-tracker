# Changelog

Alle bemerkenswerten Änderungen an diesem Projekt werden in dieser Datei dokumentiert.

Das Format basiert auf [Keep a Changelog](https://keepachangelog.com/de/1.0.0/),
und dieses Projekt folgt [Semantic Versioning](https://semver.org/lang/de/).

## [Unreleased]

### Hinzugefügt

- Must-Have Portfolio Optimierungen
  - Sichere Environment Variables (.env.docker)
  - Eliminierung von TypeScript 'any' im Backend
  - Strukturiertes Logging (Backend Logger Utility)
  - Zentralisiertes Error Handling (Frontend ErrorService)
  - Dockerfile Security (versionierte Images, Security Updates)
  - Comprehensive Documentation Structure

### Geändert

- Docker-Compose: Hardcoded Passwords durch Environment Variables ersetzt
- Backend Services: Type Safety durch Prisma Types verbessert
- Frontend: ~35 console.error durch ErrorService ersetzt
- Dokumentation: Reorganisation in docs/guides und docs/setup

### Behoben

- TypeScript 'any' Types in Backend Services
- Console.log/error Statements in Prisma Scripts
- Fehlende .dockerignore Datei
- Unprofessionelle Placeholder in README.md

## [1.0.0] - 2025-12-17

### Hinzugefügt

- Vollständiges Issue-Management System
  - CRUD-Operationen für Tickets
  - Status & Prioritäten-Verwaltung
  - Label-System
  - Kommentar-Funktion
  - Activity-Tracking

- Projekt-Management
  - Projekt CRUD-Operationen
  - Mitglieder-Verwaltung
  - Rollenbasierte Zugriffskontrolle

- Authentifizierung & Autorisierung
  - JWT-basierte Authentifizierung
  - Refresh Token Mechanismus
  - RBAC (Reporter, Developer, Manager, Admin)
  - Policy-basiertes Authorization System

- Dashboard
  - Statistik-Übersicht
  - Ticket-Verteilung Charts
  - Activity-Feed

- CI/CD Pipeline
  - GitHub Actions Workflows
  - Automated Testing
  - Code Quality Checks
  - Security Scanning

- Umfangreiche Dokumentation
  - Setup-Anleitungen
  - API-Dokumentation
  - Architektur-Guides
  - Contributing Guidelines

### Technologie-Stack

- **Frontend:** Angular 20.3, Material Design, RxJS
- **Backend:** NestJS 11, Prisma ORM, PostgreSQL
- **Monorepo:** Nx 22.2
- **TypeScript:** 5.9
- **Deployment:** Docker, Docker Compose

---

## Legende

- `Hinzugefügt` für neue Features
- `Geändert` für Änderungen an bestehender Funktionalität
- `Veraltet` für Features, die bald entfernt werden
- `Entfernt` für entfernte Features
- `Behoben` für Bug-Fixes
- `Sicherheit` für Sicherheits-Updates

[Unreleased]: https://github.com/Ademdkr/issue-tracker/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/Ademdkr/issue-tracker/releases/tag/v1.0.0
