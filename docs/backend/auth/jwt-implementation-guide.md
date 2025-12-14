# 🔐 JWT Authentication - Implementierungsanleitung

Diese Anleitung dokumentiert die vollständig implementierte JWT-Authentifizierung im Issue Tracker Backend.

---

## 📋 Übersicht

### ✅ Implementierte Features:

- ✅ JWT-basierte Authentication (AKTIV)
- ✅ Login-Endpoint (`POST /api/auth/login`)
- ✅ Passwort-Hashierung mit bcrypt
- ✅ JWT-Strategy für Passport
- ✅ JwtAuthGuard (global aktiviert)
- ✅ Public-Decorator für öffentliche Routen
- ✅ Seed-Script mit produktionsreifen Test-Daten
- ✅ Alle Dependencies installiert
- ✅ Environment Variables konfiguriert

### 🎯 Aktueller Status:

Das Backend nutzt **vollständig JWT-Authentifizierung**. Der alte `CurrentUserGuard` (x-user-id Header) wurde durch `JwtAuthGuard` ersetzt.

---

## 🔒 Aktuelle Konfiguration

### **Authentication:**

- **Global Guard:** `JwtAuthGuard` (in `app.module.ts`)
- **Öffentliche Routen:** `POST /api/auth/login` (via `@Public()` Decorator)
- **Token-Gültigkeit:** 24 Stunden
- **Passwort-Hashing:** bcrypt mit 10 Salt Rounds

### **Test-Credentials:**

| Email                   | Passwort        | Rolle     |
| ----------------------- | --------------- | --------- |
| `reporter@example.com`  | `Reporter123!`  | REPORTER  |
| `developer@example.com` | `Developer123!` | DEVELOPER |
| `manager@example.com`   | `Manager123!`   | MANAGER   |
| `admin@example.com`     | `Admin123!`     | ADMIN     |

---

## 🚀 Verwendung

### **1. Backend starten**

```powershell
npx nx serve backend
```

**Server läuft auf:** `http://localhost:3000`

---

### **2. Login durchführen**

**Endpoint:** `POST http://localhost:3000/api/auth/login`

**Request:**

```json
{
  "email": "admin@example.com",
  "password": "Admin123!"
}
```

**Response (200 OK):**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwZWNjOTAwMS0yNTRiLTQwNTgtODQ1NS1mMGZjNjFlNTMxZGEiLCJlbWFpbCI6ImFkbWluQGV4YW1wbGUuY29tIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzAwMDAwMDAwLCJleHAiOjE3MDAwODY0MDB9...",
  "user": {
    "id": "0ecc9001-254b-4058-8455-f0fc61e531da",
    "email": "admin@example.com",
    "name": "Test",
    "surname": "Admin",
    "role": "ADMIN",
    "createdAt": "2025-11-16T..."
  }
}
```

**Bei falschen Credentials (401 Unauthorized):**

```json
{
  "message": "Invalid credentials",
  "error": "Unauthorized",
  "statusCode": 401
}
```

---

### **3. Geschützte Endpoints verwenden**

Alle Endpoints (außer `/api/auth/login`) benötigen einen gültigen JWT-Token.

**Beispiel: Projekte abrufen**

```http
GET http://localhost:3000/api/projects
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**

- **Mit gültigem Token:** 200 OK + Projekt-Daten
- **Ohne Token:** 401 Unauthorized
- **Mit ungültigem/abgelaufenem Token:** 401 Unauthorized

---

## 🔍 Wie JWT funktioniert

### **Login-Flow:**

```
1. User sendet Email + Passwort
   ↓
2. AuthService validiert Credentials
   ↓
3. bcrypt vergleicht Passwort mit Hash
   ↓
4. JWT Token wird generiert (24h Gültigkeit)
   ↓
5. Response: { access_token, user }
```

### **Geschützte Route:**

```
1. Request mit Authorization Header
   ↓
2. JwtAuthGuard prüft @Public() Decorator
   ↓
3. JwtStrategy extrahiert & dekodiert Token
   ↓
4. AuthService lädt User aus Datenbank
   ↓
5. request.user wird gesetzt
   ↓
6. Controller-Handler wird ausgeführt
```

### **JWT Token Payload:**

```json
{
  "sub": "user-uuid", // User ID
  "email": "admin@example.com", // Email
  "role": "ADMIN", // Rolle
  "iat": 1700000000, // Issued At
  "exp": 1700086400 // Expires (24h später)
}
```

---

## 📊 Test-Daten in der Datenbank

Das Seed-Script hat folgende Daten erstellt:

### **👥 4 Benutzer:**

- Reporter, Developer, Manager, Admin (siehe Credentials oben)

### **📁 5 Projekte:**

1. **Logistik-Portal** (PORTAL) - erstellt von Manager
   - Mitglieder: Reporter, Developer
2. **Web-Shop** (WSHOP) - erstellt von Admin
   - Mitglieder: Developer
3. **Internes KI-System** (SYSTEM) - erstellt von Admin
   - Keine Mitglieder
4. **CRM-System** (CRM) - erstellt von Admin
   - Keine Mitglieder
5. **ERP-System** (ERP) - erstellt von Admin
   - Mitglieder: Reporter

### **🏷️ 2 Labels:**

- Bug (#FF0000) - Logistik-Portal
- Feature (#0000FF) - Logistik-Portal

### **🎫 2 Tickets:**

1. **Backend-Implementierung** (Logistik-Portal)
   - Priority: LOW
   - Assigned to: Developer
2. **Frontend-Implementierung** (Web-Shop)
   - Priority: MEDIUM
   - Unassigned

---

## 🧪 Test-Szenarien

### **Test 1: Login mit verschiedenen Rollen**

```bash
# Reporter
POST /api/auth/login
{ "email": "reporter@example.com", "password": "Reporter123!" }

# Developer
POST /api/auth/login
{ "email": "developer@example.com", "password": "Developer123!" }

# Manager
POST /api/auth/login
{ "email": "manager@example.com", "password": "Manager123!" }

# Admin
POST /api/auth/login
{ "email": "admin@example.com", "password": "Admin123!" }
```

### **Test 2: Rollenbasierte Projekt-Filterung**

```bash
# 1. Login als Developer
POST /api/auth/login
{ "email": "developer@example.com", "password": "Developer123!" }
# → Kopiere access_token

# 2. Projekte abrufen
GET /api/projects
Authorization: Bearer <developer_token>

# Ergebnis: Developer sieht nur Logistik-Portal und Web-Shop
# (Projekte in denen er Mitglied ist)
```

```bash
# 1. Login als Admin
POST /api/auth/login
{ "email": "admin@example.com", "password": "Admin123!" }
# → Kopiere access_token

# 2. Projekte abrufen
GET /api/projects
Authorization: Bearer <admin_token>

# Ergebnis: Admin sieht ALLE 5 Projekte
```

### **Test 3: Unautorisierter Zugriff**

```bash
# Ohne Token
GET /api/projects
# → 401 Unauthorized

# Mit ungültigem Token
GET /api/projects
Authorization: Bearer invalid-token-xyz
# → 401 Unauthorized
```

---

## 📂 Implementierte Dateien

### **Neue Auth-Dateien:**

| Datei                                 | Zweck                          |
| ------------------------------------- | ------------------------------ |
| `auth/services/auth.service.ts`       | Login-Logik, Token-Generierung |
| `auth/strategies/jwt.strategy.ts`     | JWT-Strategie für Passport     |
| `auth/guards/jwt-auth.guard.ts`       | JWT Authentication Guard       |
| `auth/decorators/public.decorator.ts` | @Public() Decorator            |
| `auth/auth.controller.ts`             | Login-Endpoint                 |

### **Aktualisierte Dateien:**

| Datei                 | Änderung                                              |
| --------------------- | ----------------------------------------------------- |
| `auth/auth.module.ts` | JwtModule, AuthService, JwtStrategy registriert       |
| `auth/index.ts`       | Exports für alle Auth-Components                      |
| `core/app.module.ts`  | **JwtAuthGuard als globaler Guard aktiviert**         |
| `prisma/seed.ts`      | **Vollständige Test-Daten mit gehashten Passwörtern** |
| `package.json`        | `prisma.seed` Konfiguration hinzugefügt               |
| `.env`                | `JWT_SECRET` hinzugefügt                              |

### **Konfigurationsdateien:**

| Datei          | Inhalt                               |
| -------------- | ------------------------------------ |
| `.env`         | `JWT_SECRET`, `DATABASE_URL`, `PORT` |
| `.env.example` | Template für andere Entwickler       |

---

## 🔒 Sicherheits-Features

### **1. Passwort-Sicherheit**

- ✅ bcrypt-Hashierung mit 10 Salt Rounds
- ✅ Niemals Klartext-Passwörter in DB
- ✅ Passwörter werden nicht in API-Responses zurückgegeben

### **2. Token-Sicherheit**

- ✅ JWT_SECRET aus Environment Variables
- ✅ Token-Ablauf: 24 Stunden
- ✅ Token signiert mit HS256 Algorithmus

### **3. Route-Protection**

- ✅ Globaler JwtAuthGuard
- ✅ Nur Login-Endpoint öffentlich (@Public())
- ✅ Alle anderen Routen benötigen gültigen Token

### **4. Best Practices**

- ✅ Environment Variables für Secrets
- ✅ TypeScript für Type-Safety
- ✅ Validation mit class-validator
- ✅ Error-Handling mit NestJS Exception Filters

---

## 🔧 Wartung & Erweiterung

### **Neue User hinzufügen**

Aktuell können nur Users im Seed-Script erstellt werden. Für Produktion sollte ein Admin-Endpoint implementiert werden:

```typescript
// Beispiel: POST /api/users (nur für ADMIN)
@Post('users')
@UseGuards(RoleGuard)
@Roles(UserRole.ADMIN)
async createUser(@Body() createUserDto: CreateUserDto) {
  const passwordHash = await bcrypt.hash(createUserDto.password, 10);
  return this.usersService.create({ ...createUserDto, passwordHash });
}
```

### **Passwort-Reset**

```typescript
// Beispiel: PATCH /api/users/:id/reset-password (nur für ADMIN)
@Patch('users/:id/reset-password')
@UseGuards(RoleGuard)
@Roles(UserRole.ADMIN)
async resetPassword(@Param('id') id: string, @Body() dto: ResetPasswordDto) {
  const passwordHash = await bcrypt.hash(dto.newPassword, 10);
  return this.usersService.updatePassword(id, passwordHash);
}
```

### **Token-Gültigkeit anpassen**

In `auth/auth.module.ts`:

```typescript
JwtModule.register({
  secret: process.env.JWT_SECRET,
  signOptions: {
    expiresIn: '24h', // ← Hier anpassen (z.B. '1h', '7d')
  },
});
```

### **Refresh Tokens (zukünftig)**

Für längere Sessions ohne häufiges Neu-Einloggen:

```typescript
interface LoginResponse {
  access_token: string; // Kurzlebig (1h)
  refresh_token: string; // Langlebig (30d)
  user: User;
}
```

---

## 🐛 Troubleshooting

### **Problem: "Unauthorized" bei allen Requests**

**Ursachen:**

1. Kein Authorization Header
2. Token-Format falsch (muss `Bearer <token>` sein)
3. Token abgelaufen (24h)
4. JWT_SECRET fehlt oder falsch

**Lösung:**

```bash
# Prüfe .env
cat apps/backend/.env

# Prüfe Token-Gültigkeit auf jwt.io
# Neues Login durchführen
POST /api/auth/login
```

### **Problem: "Invalid credentials" bei korrekten Daten**

**Ursachen:**

1. Seed-Script nicht ausgeführt
2. Falsches Passwort-Format
3. User existiert nicht in DB

**Lösung:**

```bash
# Seed-Script erneut ausführen
cd apps/backend
npx prisma db seed

# Prüfe User in DB
npx prisma studio
```

### **Problem: Build-Fehler nach JWT-Aktivierung**

**Lösung:**

```bash
# Cache leeren
npx nx reset

# Dependencies neu installieren
npm install

# Neu bauen
npx nx build backend
```

---

## 📚 Nächste Schritte (Optional)

### **1. Admin User-Management**

- ✅ Endpoint zum Erstellen neuer User (nur Admin)
- ✅ Endpoint zum Passwort-Reset (nur Admin)
- ✅ Endpoint zum Deaktivieren von Usern

### **2. Refresh Tokens**

- Längere Sessions ohne ständiges Neu-Einloggen
- Separate Token für Access (kurz) und Refresh (lang)

### **3. Email-Bestätigung**

- User muss Email bestätigen vor erstem Login
- Token-basierte Email-Verification

### **4. Two-Factor Authentication (2FA)**

- TOTP (Time-based One-Time Password)
- QR-Code für Authenticator Apps

### **5. Audit Logging**

- Login-Versuche tracken
- Failed-Login-Counter
- Account-Lockout nach zu vielen Fehlversuchen

---

## ✅ Zusammenfassung

### **Was läuft:**

- ✅ JWT-Authentication vollständig aktiv
- ✅ JwtAuthGuard als globaler Guard
- ✅ Login-Endpoint funktioniert
- ✅ Alle geschützten Routen benötigen Token
- ✅ Rollenbasierte Filterung funktioniert
- ✅ Test-Daten in Datenbank

### **Credentials für Tests:**

```
reporter@example.com   → Reporter123!
developer@example.com  → Developer123!
manager@example.com    → Manager123!
admin@example.com      → Admin123!
```

### **Wichtige Endpoints:**

```
POST   /api/auth/login          (öffentlich)
GET    /api/projects            (geschützt, rollenbasiert gefiltert)
GET    /api/tickets             (geschützt)
GET    /api/users               (geschützt)
...alle anderen Endpoints       (geschützt)
```

**Das Backend ist produktionsbereit mit vollständiger JWT-Authentifizierung! 🎉**

---

## 🎯 Schritt-für-Schritt Implementierung

---

### **Schritt 1: Dependencies installieren**

```powershell
npm install @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt
npm install -D @types/passport-jwt @types/bcrypt
```

**Was wird installiert:**

- `@nestjs/jwt`: JWT-Module für NestJS
- `@nestjs/passport`: Passport-Integration für NestJS
- `passport-jwt`: JWT-Strategie für Passport
- `bcrypt`: Passwort-Hashierung
- `@types/*`: TypeScript Type Definitions

---

### **Schritt 2: Environment Variables einrichten**

1. **Erstelle `.env` Datei in `apps/backend/`:**

```env
# JWT Secret Key (WICHTIG: In Production ändern!)
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-256-bits

# Datenbank (bereits vorhanden)
DATABASE_URL="postgresql://postgres:1234@localhost:5435/issue_tracker_db"
```

2. **Füge `.env` zu `.gitignore` hinzu** (falls nicht schon vorhanden):

```gitignore
# Environment files
.env
.env.local
.env.*.local
```

3. **`.env.example` wurde bereits erstellt** als Template für andere Entwickler.

---

### **Schritt 3: Seed-Script für Test-User ausführen**

Das Seed-Script erstellt Test-User mit gehashten Passwörtern.

```powershell
npx prisma db seed
```

**Output:**

```
🌱 Seeding database...
✅ Created/Updated test users:

📧 Admin:     admin@issuetracker.com → Password: Admin123!
📧 Manager:   manager@issuetracker.com → Password: Manager123!
📧 Developer: developer@issuetracker.com → Password: Dev123!
📧 Reporter:  reporter@issuetracker.com → Password: Reporter123!

💡 Verwende diese Credentials für Login-Tests!
🎉 Seeding completed!
```

**Diese Credentials kannst du später für Login-Tests verwenden!**

---

### **Schritt 4: Backend neu bauen**

```powershell
npx nx build backend
```

**Erwartetes Ergebnis:** Erfolgreicher Build ohne Fehler.

Wenn du Fehler siehst:

- Prüfe ob alle Packages installiert wurden (Schritt 1)
- Prüfe ob `.env` Datei existiert (Schritt 2)

---

### **Schritt 5: Login-Endpoint testen**

**Starte Backend:**

```powershell
npx nx serve backend
```

**Test 1: Login mit Admin-User**

```http
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "admin@issuetracker.com",
  "password": "Admin123!"
}
```

**Erwartete Response (200 OK):**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI...",
  "user": {
    "id": "uuid",
    "email": "admin@issuetracker.com",
    "name": "Admin",
    "surname": "User",
    "role": "ADMIN",
    "createdAt": "2024-11-16T..."
  }
}
```

**Test 2: Login mit falschen Credentials**

```http
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "admin@issuetracker.com",
  "password": "WrongPassword"
}
```

**Erwartete Response (401 Unauthorized):**

```json
{
  "message": "Invalid credentials",
  "error": "Unauthorized",
  "statusCode": 401
}
```

---

### **Schritt 6: JwtAuthGuard aktivieren (Optional - später)**

⚠️ **WICHTIG:** Dieser Schritt ist OPTIONAL und sollte erst gemacht werden, wenn du bereit bist, komplett auf JWT umzustellen!

**Aktuell:** `CurrentUserGuard` ist noch aktiv (nutzt `x-user-id` Header).

**Um auf JWT umzustellen:**

Öffne `apps/backend/src/app/core/app.module.ts` und ersetze:

```typescript
// VORHER:
import { CurrentUserGuard } from '../auth';

providers: [
  {
    provide: APP_GUARD,
    useClass: CurrentUserGuard, // ← Alt
  },
];

// NACHHER:
import { JwtAuthGuard } from '../auth';

providers: [
  {
    provide: APP_GUARD,
    useClass: JwtAuthGuard, // ← Neu
  },
];
```

**Nach dieser Änderung:**

- Alle Requests benötigen `Authorization: Bearer <token>` Header
- `x-user-id` Header funktioniert nicht mehr
- Login-Route bleibt öffentlich (durch `@Public()` Decorator)

---

## 📊 Implementierte Dateien

### **Neue Dateien:**

| Datei                                 | Zweck                                            |
| ------------------------------------- | ------------------------------------------------ |
| `auth/services/auth.service.ts`       | Login-Logik, Token-Generierung, User-Validierung |
| `auth/strategies/jwt.strategy.ts`     | JWT-Strategie für Passport                       |
| `auth/guards/jwt-auth.guard.ts`       | JWT Authentication Guard                         |
| `auth/decorators/public.decorator.ts` | Markiert Routen als öffentlich                   |
| `auth/auth.controller.ts`             | Login-Endpoint                                   |
| `backend/.env.example`                | Template für Environment Variables               |

### **Aktualisierte Dateien:**

| Datei                 | Änderung                                                         |
| --------------------- | ---------------------------------------------------------------- |
| `auth/auth.module.ts` | JWT-Module, AuthService, JwtStrategy, AuthController hinzugefügt |
| `auth/index.ts`       | Exports für neue Services/Guards/Decorators                      |
| `prisma/seed.ts`      | Test-User mit bcrypt-gehashten Passwörtern                       |

---

## 🔍 Wie JWT funktioniert

### **1. Login-Flow:**

```
User → POST /api/auth/login { email, password }
         ↓
AuthService prüft Credentials
         ↓
Passwort-Vergleich mit bcrypt
         ↓
JWT Token generieren
         ↓
Response { access_token, user }
```

### **2. Geschützte Route mit JWT:**

```
User → GET /api/projects
       Header: Authorization: Bearer <token>
         ↓
JwtAuthGuard extrahiert Token
         ↓
JwtStrategy dekodiert & validiert Token
         ↓
AuthService lädt User aus DB
         ↓
request.user = User-Objekt
         ↓
Controller-Handler wird ausgeführt
```

### **3. JWT Token Inhalt:**

```json
{
  "sub": "user-uuid", // User ID
  "email": "admin@example.com", // Email
  "role": "ADMIN", // Rolle
  "iat": 1700000000, // Issued At (Timestamp)
  "exp": 1700086400 // Expires (24h später)
}
```

---

## 🧪 Test-Szenarien

### **Test 1: Login mit allen Rollen**

```http
# Admin
POST /api/auth/login
{ "email": "admin@issuetracker.com", "password": "Admin123!" }

# Manager
POST /api/auth/login
{ "email": "manager@issuetracker.com", "password": "Manager123!" }

# Developer
POST /api/auth/login
{ "email": "developer@issuetracker.com", "password": "Dev123!" }

# Reporter
POST /api/auth/login
{ "email": "reporter@issuetracker.com", "password": "Reporter123!" }
```

### **Test 2: Geschützte Route mit JWT (nach Guard-Aktivierung)**

```http
# 1. Login
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "admin@issuetracker.com",
  "password": "Admin123!"
}

# Response: Kopiere access_token

# 2. Verwende Token für geschützte Route
GET http://localhost:3000/api/projects
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### **Test 3: Ohne Token (sollte 401 geben nach Guard-Aktivierung)**

```http
GET http://localhost:3000/api/projects
# Kein Authorization Header
```

**Erwartete Response (nach JwtAuthGuard-Aktivierung):**

```json
{
  "message": "Unauthorized",
  "statusCode": 401
}
```

---

## 🔒 Sicherheits-Best Practices

### **1. JWT Secret**

❌ **Niemals in Production verwenden:**

```typescript
secretOrKey: 'your-secret-key-change-in-production';
```

✅ **Immer aus .env laden:**

```typescript
secretOrKey: process.env.JWT_SECRET;
```

**Generiere sicheren Secret:**

```powershell
# Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# PowerShell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | % {[char]$_})
```

### **2. Passwort-Hashierung**

✅ **bcrypt mit Salt Rounds:**

```typescript
await bcrypt.hash(password, 10); // 10 = Balance zwischen Security & Performance
```

❌ **Niemals Klartext-Passwörter speichern!**

### **3. Token-Ablauf**

```typescript
JwtModule.register({
  signOptions: {
    expiresIn: '24h', // Token läuft nach 24 Stunden ab
  },
});
```

**Empfehlungen:**

- **Development:** `24h` oder länger
- **Production:** `1h` - `8h`
- **Refresh Tokens:** Später implementieren für längere Sessions

### **4. HTTPS in Production**

⚠️ JWT Tokens MÜSSEN über HTTPS übertragen werden!

---

## 🐛 Troubleshooting

### **Problem: "Module '@nestjs/jwt' not found"**

**Lösung:**

```powershell
npm install @nestjs/jwt @nestjs/passport passport passport-jwt
```

---

### **Problem: "Module 'bcrypt' not found"**

**Lösung:**

```powershell
npm install bcrypt
npm install -D @types/bcrypt
```

---

### **Problem: "Invalid credentials" bei korrektem Passwort**

**Mögliche Ursachen:**

1. User wurde noch nicht geseeded → `npx prisma db seed`
2. Falsches Passwort-Feld (muss `passwordHash` sein, nicht `password`)
3. bcrypt-Vergleich schlägt fehl

**Debug:**

```typescript
// In AuthService.login()
console.log('User from DB:', user);
console.log('Password from Request:', password);
console.log('Password Hash from DB:', user.passwordHash);
const isValid = await bcrypt.compare(password, user.passwordHash);
console.log('Password valid?', isValid);
```

---

### **Problem: "Unauthorized" bei geschützten Routen**

**Checklist:**

1. ✅ JwtAuthGuard in AppModule aktiviert?
2. ✅ Authorization Header korrekt? `Bearer <token>`
3. ✅ Token nicht abgelaufen? (24h Gültigkeit)
4. ✅ JWT_SECRET in .env gesetzt?

**Debug:**

```typescript
// In JwtStrategy.validate()
console.log('JWT Payload:', payload);
console.log('User from DB:', user);
```

---

### **Problem: Backend startet nicht nach Änderungen**

**Lösung:**

```powershell
# Backend-Build cleanen
npx nx reset

# Neu bauen
npx nx build backend

# Starten
npx nx serve backend
```

---

## 📚 Nächste Schritte (Optional - Bonus Features)

### **1. Refresh Tokens implementieren**

Für längere User-Sessions ohne ständiges Neu-Einloggen.

```typescript
// Beispiel-Struktur
{
  access_token: "short-lived-token",    // 1h
  refresh_token: "long-lived-token"     // 30 Tage
}
```

### **2. Admin-Endpoint für User-Erstellung**

Nur Admin kann neue User anlegen:

```typescript
@Post('users')
@UseGuards(RoleGuard)
@Roles(UserRole.ADMIN)
async createUser(@Body() createUserDto: CreateUserDto) {
  // Passwort hashen
  // User erstellen
  // Welcome-Email senden (optional)
}
```

### **3. Passwort-Reset Funktion**

Admin kann Passwörter zurücksetzen:

```typescript
@Patch('users/:id/reset-password')
@UseGuards(RoleGuard)
@Roles(UserRole.ADMIN)
async resetPassword(@Param('id') id: string) {
  // Temporäres Passwort generieren
  // Hashen und speichern
  // User per Email benachrichtigen
}
```

### **4. Email-Bestätigung**

User muss Email bestätigen vor erstem Login.

### **5. Two-Factor Authentication (2FA)**

Zusätzliche Sicherheitsebene mit TOTP.

---

## ✅ Checkliste: Implementierung abgeschlossen

- [ ] Dependencies installiert (`npm install ...`)
- [ ] `.env` Datei erstellt mit JWT_SECRET
- [ ] Seed-Script ausgeführt (`npx prisma db seed`)
- [ ] Backend erfolgreich gebaut (`npx nx build backend`)
- [ ] Login-Endpoint getestet (200 OK mit Token)
- [ ] Falsche Credentials getestet (401 Unauthorized)
- [ ] Token in JWT-Debugger analysiert (jwt.io)
- [ ] Dokumentation gelesen und verstanden

### **Optional (wenn JWT vollständig aktiviert):**

- [ ] JwtAuthGuard in AppModule aktiviert
- [ ] Geschützte Routen mit Token getestet
- [ ] Geschützte Routen ohne Token getestet (401)
- [ ] CurrentUserGuard entfernt/deaktiviert

---

## 🎯 Zusammenfassung

**Was du jetzt hast:**

- ✅ Funktionierende JWT-Authentication
- ✅ Login-Endpoint (`POST /api/auth/login`)
- ✅ Sichere Passwort-Hashierung
- ✅ Test-User für alle Rollen
- ✅ Bereit für Production (nach `.env` Anpassung)

**Was du noch tun musst:**

1. Dependencies installieren
2. `.env` erstellen
3. Seed ausführen
4. Testen

**Nächster Schritt (später):**

- JwtAuthGuard in AppModule aktivieren (ersetzt CurrentUserGuard)
- Dann nutzt das gesamte Backend JWT statt `x-user-id` Header

Viel Erfolg! 🚀
