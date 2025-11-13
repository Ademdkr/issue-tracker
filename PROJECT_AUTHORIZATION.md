# Projekt Authorization - Dokumentation

## Übersicht

Diese Dokumentation beschreibt die Authorization-Regeln für Projekt-Operationen im Issue Tracker.

## Authorization-Matrix

| Aktion                                 | Reporter | Manager | Admin |
| -------------------------------------- | -------- | ------- | ----- |
| Projekt erstellen                      | ❌       | ✅      | ✅    |
| Projekt bearbeiten (name, description) | ❌       | ✅      | ✅    |
| Slug manuell ändern                    | ❌       | ❌      | ✅    |
| Projekt löschen                        | ❌       | ❌      | ✅    |
| Projekte anzeigen                      | ✅       | ✅      | ✅    |

## API-Endpunkte

### 1. Projekt erstellen

```http
POST /api/projects
Authorization: Manager, Admin
```

**Request Body:**

```json
{
  "name": "Logistik-Portal",
  "description": "Portal für Logistikverwaltung",
  "createdBy": "uuid-des-erstellers"
}
```

**Response:**

```json
{
  "id": "generated-uuid",
  "name": "Logistik-Portal",
  "slug": "PORTAL",
  "description": "Portal für Logistikverwaltung",
  "status": "active",
  "createdBy": "uuid-des-erstellers",
  "createdAt": "2025-11-12T...",
  "updatedAt": "2025-11-12T..."
}
```

### 2. Projekt bearbeiten (Manager/Admin)

```http
PATCH /api/projects/:id
Authorization: Manager, Admin
```

**Editierbare Felder:**

- `name` (string, max. 100 Zeichen)
- `description` (string)

**Request Body:**

```json
{
  "name": "Neuer Projektname",
  "description": "Aktualisierte Beschreibung"
}
```

**Hinweis:**

- Bei Namensänderung wird automatisch ein neuer Slug generiert
- Der Slug kann NICHT über diesen Endpunkt geändert werden

### 3. Projekt bearbeiten (Admin mit Slug)

```http
PATCH /api/projects/:id/admin
Authorization: Nur Admin
```

**Editierbare Felder:**

- `name` (string, max. 100 Zeichen)
- `description` (string)
- `slug` (string, max. 50 Zeichen) - **Nur Admin**

**Request Body:**

```json
{
  "name": "Logistik-Portal",
  "slug": "CUSTOM-SLUG"
}
```

**Hinweis:**

- Admin kann den Slug manuell setzen
- Manuelle Slugs müssen eindeutig sein
- Wenn slug gesetzt wird, erfolgt KEINE automatische Generierung

### 4. Projekt löschen

```http
DELETE /api/projects/:id
Authorization: Nur Admin
```

**Response:**

```json
{
  "id": "deleted-project-id",
  "name": "Gelöschtes Projekt",
  ...
}
```

### 5. Projekte anzeigen (alle)

```http
GET /api/projects
Authorization: Keine erforderlich (öffentlich)
```

### 6. Einzelnes Projekt anzeigen

```http
GET /api/projects/:id
Authorization: Keine erforderlich (öffentlich)
```

## Testing mit Thunder Client

### Setup

1. Erstelle einen Admin-Benutzer in der Datenbank:

```sql
INSERT INTO "User" (id, email, name, password, role)
VALUES ('admin-uuid', 'admin@example.com', 'Admin', 'password', 'ADMIN');
```

2. Erstelle einen Manager-Benutzer:

```sql
INSERT INTO "User" (id, email, name, password, role)
VALUES ('manager-uuid', 'manager@example.com', 'Manager', 'password', 'MANAGER');
```

3. Erstelle einen Reporter-Benutzer:

```sql
INSERT INTO "User" (id, email, name, password, role)
VALUES ('reporter-uuid', 'reporter@example.com', 'Reporter', 'password', 'REPORTER');
```

### Test 1: Projekt erstellen als Manager

```http
POST http://localhost:3000/api/projects
Content-Type: application/json

{
  "name": "Test Projekt",
  "description": "Test Beschreibung",
  "createdBy": "manager-uuid"
}
```

**Erwartetes Ergebnis:** ✅ 201 Created

### Test 2: Projekt erstellen als Reporter

```http
POST http://localhost:3000/api/projects
Content-Type: application/json

{
  "name": "Test Projekt",
  "description": "Test Beschreibung",
  "createdBy": "reporter-uuid"
}
```

**Erwartetes Ergebnis:** ❌ 403 Forbidden

### Test 3: Projekt bearbeiten als Manager (name + description)

```http
PATCH http://localhost:3000/api/projects/projekt-id
Content-Type: application/json
x-user-id: manager-uuid

{
  "name": "Aktualisierter Name",
  "description": "Neue Beschreibung"
}
```

**Erwartetes Ergebnis:** ✅ 200 OK

### Test 4: Projekt bearbeiten als Manager (mit slug - sollte NICHT funktionieren)

```http
PATCH http://localhost:3000/api/projects/projekt-id
Content-Type: application/json
x-user-id: manager-uuid

{
  "slug": "custom-slug"
}
```

**Erwartetes Ergebnis:** ❌ 400 Bad Request (slug ist nicht in UpdateProjectDto)

### Test 5: Admin-Update mit slug

```http
PATCH http://localhost:3000/api/projects/projekt-id/admin
Content-Type: application/json
x-user-id: admin-uuid

{
  "slug": "CUSTOM-SLUG"
}
```

**Erwartetes Ergebnis:** ✅ 200 OK

### Test 6: Admin-Update als Manager (sollte fehlschlagen)

```http
PATCH http://localhost:3000/api/projects/projekt-id/admin
Content-Type: application/json
x-user-id: manager-uuid

{
  "slug": "CUSTOM-SLUG"
}
```

**Erwartetes Ergebnis:** ❌ 403 Forbidden

### Test 7: Projekt löschen als Admin

```http
DELETE http://localhost:3000/api/projects/projekt-id
x-user-id: admin-uuid
```

**Erwartetes Ergebnis:** ✅ 200 OK

### Test 8: Projekt löschen als Manager

```http
DELETE http://localhost:3000/api/projects/projekt-id
x-user-id: manager-uuid
```

**Erwartetes Ergebnis:** ❌ 403 Forbidden

## Fehlerbehandlung

### 403 Forbidden - Keine Berechtigung

```json
{
  "message": "Access denied. Required roles: manager, admin",
  "statusCode": 403
}
```

### 400 Bad Request - Slug bereits vergeben

```json
{
  "message": "Slug \"CUSTOM-SLUG\" wird bereits verwendet",
  "statusCode": 400
}
```

### 404 Not Found - Benutzer nicht gefunden

```json
{
  "message": "Creator user not found",
  "statusCode": 404
}
```

## Implementation Details

### DTOs

- `UpdateProjectDto`: Für Manager/Admin - enthält nur `name` und `description`
- `AdminUpdateProjectDto`: Nur für Admin - enthält zusätzlich `slug`

### Service-Methoden

- `create()`: Validiert Manager/Admin-Rolle
- `update()`: Normale Bearbeitung, generiert Slug bei Namensänderung
- `adminUpdate()`: Admin-Bearbeitung, erlaubt manuelle Slug-Änderung
- `remove()`: Löschen (nur über RoleGuard geschützt)

### Guards

- `RoleGuard`: Liest User-ID aus `x-user-id` Header oder `createdBy` Body
- Validiert Benutzer-Rolle gegen Prisma-Datenbank
- Admins können alle Manager-Aktionen ausführen

## Sicherheitshinweise

1. **User-ID Übermittlung**: Aktuell wird die User-ID über Header/Body übertragen

   - ⚠️ In Produktion JWT-Token verwenden
   - ⚠️ User-ID aus Token extrahieren statt aus Request

2. **Password-Hashing**: Aktuell werden Passwörter im Klartext gespeichert

   - ⚠️ Bcrypt-Hashing implementieren vor Produktion

3. **Rate Limiting**:

   - ⚠️ Rate Limiting für API-Endpunkte implementieren
   - ⚠️ Besonders bei DELETE-Operationen

4. **Audit Logging**:
   - ⚠️ Logging von Admin-Aktionen (Slug-Änderungen, Löschungen)
   - ⚠️ Activity-Tabelle für Nachverfolgbarkeit
