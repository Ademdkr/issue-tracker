# Security Policy

## Unterstützte Versionen

Wir unterstützen aktiv die folgenden Versionen mit Sicherheitsupdates:

| Version | Unterstützt          |
| ------- | -------------------- |
| 1.x.x   | :white_check_mark:   |
| < 1.0   | :x:                  |

## Sicherheitslücken melden

Die Sicherheit unseres Projekts ist uns wichtig. Wenn Sie eine Sicherheitslücke entdecken, bitten wir Sie, diese verantwortungsvoll zu melden.

### Meldeprozess

**Bitte melden Sie Sicherheitslücken NICHT über öffentliche GitHub Issues.**

Stattdessen senden Sie bitte eine E-Mail mit Details an:

- **Kontakt:** [Ihre E-Mail-Adresse hier einfügen]

Sie sollten innerhalb von 48 Stunden eine Bestätigung erhalten. Nach der ersten Antwort wird das Sicherheitsteam Sie über den Fortschritt bei der Behebung und der vollständigen Veröffentlichung auf dem Laufenden halten.

### Was Sie in Ihrer Meldung angeben sollten

Bitte geben Sie so viele der folgenden Informationen wie möglich an:

- Art der Sicherheitslücke (z.B. XSS, CSRF, SQL Injection, etc.)
- Vollständige Pfade der betroffenen Quelldatei(en)
- Speicherort des betroffenen Quellcodes (Tag/Branch/Commit oder direkte URL)
- Besondere Konfiguration, die erforderlich ist, um das Problem zu reproduzieren
- Schritt-für-Schritt-Anweisungen zur Reproduktion des Problems
- Proof-of-Concept oder Exploit-Code (falls möglich)
- Auswirkung der Sicherheitslücke, einschließlich möglicher Angriffsvektoren

Diese Informationen helfen uns, Ihre Meldung schneller zu bearbeiten.

### Bevorzugte Sprachen

Wir bevorzugen alle Kommunikation auf Deutsch oder Englisch.

## Sicherheitsrichtlinien

### Authentifizierung & Autorisierung

- JWT-basierte Authentifizierung mit sicheren Secrets
- Rollenbasierte Zugriffskontrolle (RBAC)
- Policy-basierte Autorisierung
- Sichere Passwort-Hashing (bcrypt)

### Datenbank-Sicherheit

- Parametrisierte Queries (Prisma ORM)
- Zugriffskontrolle auf Datenbankebene
- Verschlüsselte Verbindungen (SSL/TLS)

### API-Sicherheit

- CORS-Konfiguration
- Rate Limiting
- Input Validation
- Error Handling ohne Informationslecks

### Abhängigkeiten

- Regelmäßige Dependency Updates
- Automatisierte Security Audits (GitHub Dependabot)
- CodeQL Security Scanning

## Anerkennungen

Wir danken allen Sicherheitsforschern, die verantwortungsvoll zur Sicherheit dieses Projekts beitragen.

## Weitere Informationen

Für weitere Informationen zur Sicherheit konsultieren Sie bitte:

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [NestJS Security](https://docs.nestjs.com/security/authentication)
- [Angular Security](https://angular.io/guide/security)
