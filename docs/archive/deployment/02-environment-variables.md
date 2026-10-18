> Historisches Dokument. Maßgeblich sind [Deployment](../../deployment/README.md) und [Schnellstart](../../QUICKSTART.md). Beispiele können veraltet sein.

# 1.2 Umgebungsvariablen vorbereiten

## 📋 Übersicht

Dieser Schritt bereitet alle notwendigen Environment Variables für das Production-Deployment vor. Dabei werden sichere Secrets generiert und dokumentiert.

---

## 🎯 Ziel

- Sichere JWT Secrets generieren
- Environment Variables Template erstellen
- Secrets sicher dokumentieren (nicht im Git!)
- Vorbereitung für Render Dashboard Konfiguration

---

## 📁 Erstellte Dateien

### 1. Environment Template

**Speicherort**: `config/env/production.env.example`

Diese Datei wurde im Projekt-Root erstellt und dient als Template. Sie enthält:

- Alle benötigten Environment Variables
- Beschreibungen für jede Variable
- Platzhalter für Secrets
- ⚠️ **Wird NICHT committed** (bereits in `.gitignore`)

---

## 🔐 Secrets generieren

### JWT Secrets

Generiere zwei sichere, zufällige Secrets für JWT-Signierung:

**Auf Windows (PowerShell)**:

```powershell
# JWT_SECRET generieren
$bytes = New-Object byte[] 32
[Security.Cryptography.RNGCryptoServiceProvider]::Create().GetBytes($bytes)
[Convert]::ToBase64String($bytes)

# JWT_REFRESH_SECRET generieren
$bytes = New-Object byte[] 32
[Security.Cryptography.RNGCryptoServiceProvider]::Create().GetBytes($bytes)
[Convert]::ToBase64String($bytes)
```

**Auf macOS/Linux (Terminal)**:

```bash
# JWT_SECRET generieren
openssl rand -base64 32

# JWT_REFRESH_SECRET generieren
openssl rand -base64 32
```

**Online-Alternative** (falls kein OpenSSL verfügbar):

- https://generate-secret.vercel.app/32

**Wichtig**:

- ✅ Mindestens 32 Zeichen
- ✅ Zufällig generiert
- ✅ Unterschiedliche Werte für Secret und Refresh Secret
- ❌ NIEMALS die Beispielwerte verwenden
- ❌ NIEMALS in Git committen

---

## 📝 Environment Variables Übersicht

### Backend Environment Variables

#### Kritische Secrets (manuell setzen)

| Variable             | Typ    | Erforderlich | Beschreibung                 | Beispiel                |
| -------------------- | ------ | ------------ | ---------------------------- | ----------------------- |
| `JWT_SECRET`         | Secret | ✅ Ja        | JWT Access Token Signierung  | `wX9k2P...` (generiert) |
| `JWT_REFRESH_SECRET` | Secret | ✅ Ja        | JWT Refresh Token Signierung | `mL3n8Q...` (generiert) |

#### Automatisch von Render

| Variable              | Typ    | Quelle             | Beschreibung                                |
| --------------------- | ------ | ------------------ | ------------------------------------------- |
| `DATABASE_URL`        | String | PostgreSQL Service | **Internal Database URL** (nicht External!) |
| `RENDER_EXTERNAL_URL` | String | Render             | Öffentliche Service URL                     |
| `RENDER_INTERNAL_URL` | String | Render             | Interne Service URL                         |

**⚠️ WICHTIG: Verwende die Internal Database URL!**

- ✅ Schneller (internes Netzwerk)
- ✅ Sicherer (nicht öffentlich erreichbar)
- ✅ Kostenlos (kein External Traffic)

```bash
# ✅ RICHTIG: Internal URL
postgresql://user:pass@dpg-xxxxx/database

# ❌ FALSCH: External URL
postgresql://user:pass@dpg-xxxxx.frankfurt-postgres.render.com/database
```

#### Statische Konfiguration

| Variable                 | Typ    | Wert                                  | Beschreibung                       |
| ------------------------ | ------ | ------------------------------------- | ---------------------------------- |
| `NODE_ENV`               | String | `production`                          | Node.js Umgebung                   |
| `PORT`                   | Number | `3000`                                | Backend Server Port                |
| `JWT_EXPIRES_IN`         | String | `15m`                                 | Access Token Lifetime (15 Minuten) |
| `JWT_REFRESH_EXPIRES_IN` | String | `7d`                                  | Refresh Token Lifetime (7 Tage)    |
| `FRONTEND_URL`           | String | `https://issue-tracker.ademdokur.dev` | Frontend URL für CORS              |
| `CORS_ORIGINS`           | String | `https://issue-tracker.ademdokur.dev` | Erlaubte CORS Origins              |
| `THROTTLE_TTL`           | Number | `60000`                               | Rate Limit Zeitfenster (60s)       |
| `THROTTLE_LIMIT`         | Number | `100`                                 | Max Requests pro Zeitfenster       |

#### Optional

| Variable          | Typ     | Wert   | Beschreibung          |
| ----------------- | ------- | ------ | --------------------- |
| `SWAGGER_ENABLED` | Boolean | `true` | Swagger UI aktivieren |
| `LOG_LEVEL`       | String  | `info` | Logging-Level         |

---

### Frontend Environment Variables

| Variable      | Typ    | Quelle          | Beschreibung                             |
| ------------- | ------ | --------------- | ---------------------------------------- |
| `BACKEND_URL` | String | Backend Service | Automatisch von Render via `render.yaml` |

---

## 🔒 Secrets sicher speichern

### Lokale Datei erstellen (NICHT committen!)

Erstelle eine Datei `.env.production` (lokal, nur für deine Referenz):

```bash
# Kopiere Template
cp config/env/production.env.example .env.production

# Öffne in Editor
code .env.production  # oder nano, vim, etc.
```

Fülle die generierten Secrets ein:

```env
JWT_SECRET=wX9k2PmL3n8QrT5vY1zA4bC6dE7fG8hJ9kL0mN2oP3qR4sT5uV6wX7yZ8aB9cD0e
JWT_REFRESH_SECRET=mL3n8QrT5vY1zA4bC6dE7fG8hJ9kL0mN2oP3qR4sT5uV6wX7yZ8aB9cD0ewX9k2P
```

**Wichtig**:

- ✅ `.env.production` ist bereits in `.gitignore`
- ✅ Wird NICHT ins Repository committed
- ✅ Nur für lokale Referenz
- ⚠️ Bewahre diese Datei sicher auf (z.B. Passwort-Manager)

---

## 📤 Secrets für Render vorbereiten

Bereite folgende Informationen vor, um sie später im Render Dashboard einzutragen:

### Checklist: Secrets bereit zum Eingeben

Notiere folgende Werte in einem sicheren Dokument (z.B. `.env.production` lokal):

```
✅ JWT_SECRET=___________________________________________
✅ JWT_REFRESH_SECRET=___________________________________
✅ FRONTEND_URL=https://issue-tracker.ademdokur.dev
✅ CORS_ORIGINS=https://issue-tracker.ademdokur.dev
```

Diese Werte werden später in **Render Dashboard → Backend Service → Environment** eingetragen.

---

## ✅ Validierung

### Secrets-Checklist

Prüfe, ob deine generierten Secrets folgende Kriterien erfüllen:

- [ ] **JWT_SECRET generiert**: Mindestens 32 Zeichen, zufällig
- [ ] **JWT_REFRESH_SECRET generiert**: Mindestens 32 Zeichen, zufällig
- [ ] **Secrets unterschiedlich**: JWT_SECRET ≠ JWT_REFRESH_SECRET
- [ ] **Secrets notiert**: Sicher gespeichert (nicht im Git!)
- [ ] **Template erstellt**: `config/env/production.env.example` vorhanden
- [ ] **Gitignore geprüft**: `.env.production` wird ignoriert

### Format-Validierung

**JWT_SECRET prüfen**:

```bash
# Länge sollte mindestens 32 Zeichen sein
echo -n "dein-generiertes-secret" | wc -c
```

**Base64-Format prüfen**:

```bash
# Sollte nur Base64-Zeichen enthalten: A-Z, a-z, 0-9, +, /, =
echo "dein-generiertes-secret" | grep -E '^[A-Za-z0-9+/=]+$'
```

---

## 🚨 Sicherheitshinweise

### ❌ Was NICHT tun

1. **Keine Secrets im Code committen**

   ```bash
   # FALSCH - niemals!
   git add .env.production
   ```

2. **Keine Default-Werte verwenden**

   ```env
   # FALSCH - unsicher!
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   ```

3. **Keine Secrets in Logs ausgeben**
   ```typescript
   // FALSCH - niemals!
   console.log('JWT_SECRET:', process.env.JWT_SECRET);
   ```

### ✅ Best Practices

1. **Secrets in Render Dashboard setzen**

   - Niemals in `render.yaml` oder anderen Code-Dateien
   - Nutze Render's Environment Variables UI

2. **Secrets regelmäßig rotieren**

   - JWT Secrets alle 90 Tage erneuern
   - Bei Security-Incidents sofort ändern

3. **Separate Secrets für Umgebungen**

   - Development ≠ Staging ≠ Production
   - Niemals Production-Secrets in Development

4. **Passwort-Manager verwenden**
   - 1Password, LastPass, Bitwarden
   - Verschlüsselte Notizen
   - Niemals in Plain-Text Dateien

---

## 📋 Nächste Schritte

Nach Generierung der Secrets:

### 1. Secrets dokumentieren

Speichere Secrets in Passwort-Manager oder verschlüsselter Datei:

```
Projekt: Issue Tracker Production
Service: Backend (Render)

JWT_SECRET: [generierter Wert]
JWT_REFRESH_SECRET: [generierter Wert]
FRONTEND_URL: https://issue-tracker.ademdokur.dev
CORS_ORIGINS: https://issue-tracker.ademdokur.dev

Generiert am: 29.12.2025
Nächste Rotation: 29.03.2026
```

### 2. Gitignore prüfen

Stelle sicher, dass `.env.production` ignoriert wird:

```bash
# Prüfe .gitignore
cat .gitignore | grep ".env.production"

# Sollte vorhanden sein:
# .env.production
# .env*.local
```

### 3. Template committen

Nur das Template (ohne Secrets) committen:

```bash
git add config/env/production.env.example
git commit -m "feat: Add production environment variables template"
```

---

## 🔧 Troubleshooting

### Problem: "Secrets zu kurz"

**Symptom**: Generierte Secrets haben weniger als 32 Zeichen

**Lösung**:

```bash
# Verwende -base64 Option mit 32 Bytes
openssl rand -base64 32

# Oder 48 Bytes für längere Secrets
openssl rand -base64 48
```

### Problem: "OpenSSL nicht verfügbar"

**Symptom**: `openssl: command not found`

**Lösung Windows**:

```powershell
# Verwende PowerShell RNG
$bytes = New-Object byte[] 32
[Security.Cryptography.RNGCryptoServiceProvider]::Create().GetBytes($bytes)
[Convert]::ToBase64String($bytes)
```

**Lösung Alternative**:

- Nutze Online-Generator: https://generate-secret.vercel.app/32
- Installiere OpenSSL: https://slproweb.com/products/Win32OpenSSL.html

### Problem: ".env.production wird committed"

**Symptom**: Git will `.env.production` tracken

**Lösung**:

```bash
# Prüfe Status
git status

# Entferne aus Staging
git rm --cached .env.production

# Füge zu .gitignore hinzu
echo ".env.production" >> .gitignore

# Committe .gitignore
git add .gitignore
git commit -m "chore: Ignore .env.production file"
```

---

## 📚 Weitere Ressourcen

- [Render Environment Variables](https://render.com/docs/environment-variables)
- [OWASP: Secrets Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [dotenv Best Practices](https://github.com/motdotla/dotenv#should-i-commit-my-env-file)

---

## ✅ Status

- [x] `config/env/production.env.example` erstellt
- [x] JWT Secrets generiert
- [x] Secrets sicher notiert (nicht im Git)
- [x] Environment Variables dokumentiert
- [x] Sicherheits-Checkliste durchgegangen

**Bereit für nächsten Schritt**: 2.1 Datenbank auf Render erstellen

---

**Schritt abgeschlossen**: ✅  
**Dauer**: ~10 Minuten  
**Nächster Schritt**: Render Dashboard öffnen und Datenbank anlegen
