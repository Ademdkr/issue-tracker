# Projektmitglieder - API Dokumentation

## Übersicht

Projektmitglieder-Verwaltung ermöglicht es Managern und Admins, Benutzer zu Projekten hinzuzufügen und zu entfernen. Nur Projektmitglieder (sowie Manager und Admins) können auf Projektdetails zugreifen.

## Authorization-Matrix

| Aktion                | Reporter/Developer (Nicht-Mitglied) | Reporter/Developer (Mitglied) | Manager | Admin |
| --------------------- | ----------------------------------- | ----------------------------- | ------- | ----- |
| Projekt ansehen       | ❌                                  | ✅                            | ✅      | ✅    |
| Mitglieder hinzufügen | ❌                                  | ❌                            | ✅      | ✅    |
| Mitglieder entfernen  | ❌                                  | ❌                            | ✅      | ✅    |
| Mitglieder anzeigen   | ❌                                  | ❌                            | ✅      | ✅    |

## API-Endpunkte

### 1. Projektmitglieder abrufen

```http
GET /api/projects/:id/members
Authorization: Manager, Admin
```

**Response:**

```json
[
  {
    "userId": "user-uuid",
    "user": {
      "id": "user-uuid",
      "name": "Max",
      "surname": "Mustermann",
      "email": "max@example.com",
      "role": "developer"
    },
    "addedBy": {
      "id": "manager-uuid",
      "name": "Anna",
      "surname": "Manager"
    },
    "addedAt": "2025-11-12T20:00:00.000Z"
  }
]
```

### 2. Mitglied hinzufügen

```http
POST /api/projects/:id/members
Authorization: Manager, Admin
```

**Request Body:**

```json
{
  "userId": "user-uuid-to-add",
  "addedBy": "manager-uuid"
}
```

**Response:**

```json
{
  "message": "User Max Mustermann added to project Logistik-Portal"
}
```

**Fehler:**

- `400 Bad Request` - User ist bereits Mitglied
- `404 Not Found` - Projekt oder User nicht gefunden
- `403 Forbidden` - Keine Berechtigung

### 3. Mitglied entfernen

```http
DELETE /api/projects/:id/members/:userId
Authorization: Manager, Admin
```

**Response:**

```json
{
  "message": "User Max Mustermann removed from project Logistik-Portal"
}
```

**Fehler:**

- `404 Not Found` - User ist kein Mitglied oder Projekt nicht gefunden
- `403 Forbidden` - Keine Berechtigung

### 4. Projekt ansehen (mit Zugriffsprüfung)

```http
GET /api/projects/:id
Authorization: Projektmitglied, Manager oder Admin
Header: x-user-id: <user-uuid>
```

**Response:**

```json
{
  "id": "project-uuid",
  "name": "Logistik-Portal",
  "slug": "PORTAL",
  "description": "Portal für Logistikverwaltung",
  "status": "active",
  "createdBy": "creator-uuid",
  "createdAt": "2025-11-12T...",
  "updatedAt": "2025-11-12T..."
}
```

**Fehler:**

- `403 Forbidden` - Benutzer ist kein Mitglied und kein Manager/Admin
- `404 Not Found` - Projekt nicht gefunden

## Testing mit Thunder Client

### Setup: Test-Daten erstellen

```sql
-- Admin erstellen
INSERT INTO "User" (id, email, name, surname, password, role)
VALUES ('admin-uuid', 'admin@example.com', 'Admin', 'User', 'password', 'ADMIN');

-- Manager erstellen
INSERT INTO "User" (id, email, name, surname, password, role)
VALUES ('manager-uuid', 'manager@example.com', 'Manager', 'User', 'password', 'MANAGER');

-- Developer erstellen
INSERT INTO "User" (id, email, name, surname, password, role)
VALUES ('dev-uuid', 'dev@example.com', 'Max', 'Developer', 'password', 'DEVELOPER');

-- Projekt erstellen
INSERT INTO "Project" (id, name, description, slug, created_by)
VALUES ('project-uuid', 'Test Projekt', 'Beschreibung', 'TEST', 'manager-uuid');
```

### Test 1: Mitglied hinzufügen (als Manager)

```http
POST http://localhost:3000/api/projects/project-uuid/members
Content-Type: application/json
x-user-id: manager-uuid

{
  "userId": "dev-uuid",
  "addedBy": "manager-uuid"
}
```

**Erwartetes Ergebnis:** ✅ 201 Created

```json
{
  "message": "User Max Developer added to project Test Projekt"
}
```

### Test 2: Mitglied hinzufügen (Duplikat)

```http
POST http://localhost:3000/api/projects/project-uuid/members
Content-Type: application/json
x-user-id: manager-uuid

{
  "userId": "dev-uuid",
  "addedBy": "manager-uuid"
}
```

**Erwartetes Ergebnis:** ❌ 400 Bad Request

```json
{
  "message": "User is already a member of this project",
  "statusCode": 400
}
```

### Test 3: Projekt ansehen (als Mitglied)

```http
GET http://localhost:3000/api/projects/project-uuid
x-user-id: dev-uuid
```

**Erwartetes Ergebnis:** ✅ 200 OK (Projekt-Daten)

### Test 4: Projekt ansehen (als Nicht-Mitglied)

```http
GET http://localhost:3000/api/projects/project-uuid
x-user-id: other-user-uuid
```

**Erwartetes Ergebnis:** ❌ 403 Forbidden

```json
{
  "message": "Access denied. You are not a member of this project.",
  "statusCode": 403
}
```

### Test 5: Projekt ansehen (als Manager - ohne Mitgliedschaft)

```http
GET http://localhost:3000/api/projects/project-uuid
x-user-id: manager-uuid
```

**Erwartetes Ergebnis:** ✅ 200 OK (Manager haben immer Zugriff)

### Test 6: Mitglieder auflisten

```http
GET http://localhost:3000/api/projects/project-uuid/members
x-user-id: manager-uuid
```

**Erwartetes Ergebnis:** ✅ 200 OK (Liste aller Mitglieder)

### Test 7: Mitglied entfernen

```http
DELETE http://localhost:3000/api/projects/project-uuid/members/dev-uuid
x-user-id: manager-uuid
```

**Erwartetes Ergebnis:** ✅ 200 OK

```json
{
  "message": "User Max Developer removed from project Test Projekt"
}
```

### Test 8: Mitglied hinzufügen (als Developer - sollte fehlschlagen)

```http
POST http://localhost:3000/api/projects/project-uuid/members
Content-Type: application/json
x-user-id: dev-uuid

{
  "userId": "other-user-uuid",
  "addedBy": "dev-uuid"
}
```

**Erwartetes Ergebnis:** ❌ 403 Forbidden

## Implementation Details

### ProjectAccessGuard

- Prüft ob Benutzer Admin/Manager ist → Zugriff erlaubt
- Prüft ob Benutzer Projektmitglied ist → Zugriff erlaubt
- Sonst → 403 Forbidden

### Service-Methoden

**`addMember(projectId, addMemberDto)`**

- Validiert Projekt-Existenz
- Validiert User-Existenz
- Prüft auf Duplikate
- Erstellt Mitgliedschaft in `project_members`-Tabelle

**`removeMember(projectId, userId)`**

- Prüft ob Mitgliedschaft existiert
- Löscht Mitgliedschaft aus Datenbank
- Gibt Bestätigungsnachricht zurück

**`hasProjectAccess(projectId, userId)`**

- Gibt `true` zurück für Admins/Manager
- Prüft Mitgliedschaft in Datenbank
- Wird von `ProjectAccessGuard` verwendet

**`getProjectMembers(projectId)`**

- Ruft alle Mitglieder eines Projekts ab
- Inkludiert User-Informationen und "addedBy"-Daten
- Sortiert nach `addedAt` (neueste zuerst)

### Prisma Schema

```prisma
model ProjectMember {
  projectId String   @map("project_id") @db.Uuid
  userId    String   @map("user_id") @db.Uuid
  addedBy   String   @map("added_by") @db.Uuid
  addedAt   DateTime @default(now()) @map("added_at")

  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
  user    User    @relation("ProjectMemberUser", fields: [userId], references: [id], onDelete: Cascade)
  adder   User    @relation("ProjectMemberAdder", fields: [addedBy], references: [id])

  @@id([projectId, userId])
}
```

## Sicherheitshinweise

1. **User-ID Übermittlung**:

   - ⚠️ Aktuell über `x-user-id` Header
   - 🔒 In Produktion: JWT-Token verwenden

2. **Cascade Delete**:

   - ✅ Mitgliedschaften werden automatisch gelöscht wenn Projekt gelöscht wird
   - ✅ Mitgliedschaften werden automatisch gelöscht wenn User gelöscht wird

3. **Authorization Checks**:

   - ✅ RoleGuard für Manager/Admin-Operationen
   - ✅ ProjectAccessGuard für Projektzugriff
   - ✅ Doppelte Prüfung in Service-Layer

4. **Validation**:
   - ✅ UUIDs werden validiert
   - ✅ Duplikate werden verhindert
   - ✅ Nicht-existierende User/Projekte werden abgefangen

## Workflow-Beispiel

1. **Manager erstellt Projekt**

   ```
   POST /api/projects
   → Projekt "Web-Shop" erstellt
   ```

2. **Manager fügt Entwickler hinzu**

   ```
   POST /api/projects/{id}/members
   Body: { userId: "dev1-uuid", addedBy: "manager-uuid" }
   → Developer ist nun Mitglied
   ```

3. **Developer greift auf Projekt zu**

   ```
   GET /api/projects/{id}
   Header: x-user-id: dev1-uuid
   → Zugriff erlaubt (ist Mitglied)
   ```

4. **Nicht-Mitglied versucht Zugriff**

   ```
   GET /api/projects/{id}
   Header: x-user-id: other-uuid
   → 403 Forbidden (kein Mitglied, kein Manager/Admin)
   ```

5. **Manager entfernt Mitglied**
   ```
   DELETE /api/projects/{id}/members/dev1-uuid
   → Mitgliedschaft gelöscht
   ```
