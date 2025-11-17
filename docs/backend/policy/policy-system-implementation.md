# Policy System - Implementierungsdetails

Dieses Dokument erklärt die Implementierung des Policy-basierten Berechtigungssystems im Detail.

## Inhaltsverzeichnis

- [Übersicht](#übersicht)
- [Interface vs Abstract Class Pattern](#interface-vs-abstract-class-pattern)
- [CheckPolicies Decorator](#checkpolicies-decorator)
- [PoliciesGuard Implementierung](#policiesguard-implementierung)
- [TypeScript Syntax Details](#typescript-syntax-details)
- [Dependency Injection Flow](#dependency-injection-flow)
- [Best Practices](#best-practices)

---

## Übersicht

Das Policy System implementiert ein flexibles Berechtigungssystem basierend auf Policy-Klassen.

### Warum dieser Ansatz?

- **Separation of Concerns**: Berechtigungslogik getrennt von Controller-Logik
- **Wiederverwendbarkeit**: Eine Policy kann in mehreren Controllern verwendet werden
- **Testbarkeit**: Policies können isoliert getestet werden
- **Erweiterbarkeit**: Neue Berechtigungen ohne Controller-Änderungen
- **Single Responsibility**: Jede Policy hat genau eine Verantwortung

### Ablauf

1. Developer annotiert Controller-Methode mit `@CheckPolicies(PolicyClass)`
2. Guard wird vor der Controller-Methode ausgeführt
3. Guard holt die Policy-Klassen aus den Metadaten
4. Guard instantiiert jede Policy aus dem DI-Container
5. Guard ruft `policy.handle(user)` auf
6. Wenn EINE Policy `false` zurückgibt → `ForbiddenException`
7. Wenn ALLE Policies `true` zurückgeben → Request wird durchgelassen

---

## Interface vs Abstract Class Pattern

### IPolicyHandler Interface

```typescript
export interface IPolicyHandler<T = unknown> {
  handle(user: User, resource?: T): Promise<boolean> | boolean;
}
```

**Warum ein Interface?**

- Definiert einen klaren **Vertrag** für alle Policies
- Ermöglicht Dependency Injection in NestJS
- **Type-Safety**: TypeScript prüft zur Compile-Zeit, ob alle Policies `handle()` implementieren
- Ermöglicht es dem PoliciesGuard, alle Policies einheitlich aufzurufen

**Generic Parameter `<T>`**

- `T` = Typ der zu prüfenden Resource (z.B. `Ticket`, `Project`, `Comment`)
- Standardwert: `unknown` (wenn keine spezifische Resource benötigt wird)

**Parameter**

| Parameter  | Typ    | Optional | Beschreibung                              |
| ---------- | ------ | -------- | ----------------------------------------- |
| `user`     | `User` | Nein     | Der angemeldete User (aus `shared-types`) |
| `resource` | `T`    | Ja       | Die zu prüfende Resource (future-proof)   |

**Rückgabewert**

- `boolean`: Für synchrone Prüfungen (z.B. nur Rollen-Check)
- `Promise<boolean>`: Für asynchrone Prüfungen (z.B. DB-Abfrage)
- `true` = Aktion erlaubt
- `false` = Aktion verboten (führt zu `ForbiddenException`)

**Warum `Promise<boolean> | boolean` (Union Type)?**

- Flexibilität: Policy kann synchron oder asynchron sein
- NestJS Guards unterstützen beide Varianten
- `await` funktioniert sowohl mit `Promise` als auch mit direktem `boolean`

### PolicyHandler Abstract Class

```typescript
export abstract class PolicyHandler<T = unknown> implements IPolicyHandler<T> {
  abstract handle(user: User, resource?: T): Promise<boolean> | boolean;
}
```

**Warum eine Abstract Class zusätzlich zum Interface?**

#### 1. Future-Proof

Falls später gemeinsame Logik für alle Policies benötigt wird (z.B. Logging, Caching, Audit-Trail), kann diese hier zentral implementiert werden, ohne jede Policy einzeln anzupassen.

```typescript
// Zukünftige Erweiterung (Beispiel)
export abstract class PolicyHandler<T = unknown> implements IPolicyHandler<T> {
  abstract handle(user: User, resource?: T): Promise<boolean> | boolean;

  // Gemeinsame Methoden für alle Policies
  protected log(action: string, user: User): void {
    console.log(`[Policy] ${action} by user ${user.id}`);
  }

  protected async checkCache(key: string): Promise<boolean | null> {
    // Cache-Logik
  }
}
```

#### 2. Optionale Verwendung

- Policies können ENTWEDER das Interface implementieren
- ODER von dieser Klasse erben
- Beide Ansätze funktionieren mit dem PoliciesGuard

```typescript
// Ansatz 1: Interface implementieren
class UpdateTicketPolicyHandler implements IPolicyHandler<Ticket> {
  handle(user: User, resource?: Ticket): boolean {
    /* ... */
  }
}

// Ansatz 2: Von Abstract Class erben
class DeleteTicketPolicyHandler extends PolicyHandler<Ticket> {
  handle(user: User, resource?: Ticket): boolean {
    /* ... */
  }
}
```

#### 3. TypeScript-Pattern

| Pattern            | Rolle                 | Zweck                            |
| ------------------ | --------------------- | -------------------------------- |
| **Interface**      | Vertrag               | Was muss implementiert werden    |
| **Abstract Class** | Basis-Implementierung | Wie kann es implementiert werden |

**Warum `abstract`?**

- Die Klasse kann nicht direkt instantiiert werden (`new PolicyHandler()` funktioniert nicht)
- Zwingt Entwickler, eine konkrete Klasse zu erstellen (z.B. `UpdateTicketPolicyHandler`)
- Die `handle()` Methode MUSS in der erbenden Klasse implementiert werden

**Warum `implements IPolicyHandler<T>`?**

- Stellt sicher, dass die Abstract Class den gleichen Vertrag wie das Interface hat
- TypeScript prüft, ob alle Interface-Methoden vorhanden sind
- Ermöglicht Polymorphie: `PolicyHandler` kann überall verwendet werden, wo `IPolicyHandler` erwartet wird

---

## CheckPolicies Decorator

### Syntax

```typescript
export const CheckPolicies = (...handlers: PolicyHandlerClass[]) => Reflect.metadata(CHECK_POLICIES_KEY, handlers);
```

### Syntax-Erklärung

```typescript
export const CheckPolicies = (...handlers: PolicyHandlerClass[]) =>
              ^^^^^^^^^^^^^^   ^^^                                ^^
              |                |                                  |
              Decorator-Name   Rest-Parameter (beliebig viele)   Arrow Function

  Reflect.metadata(CHECK_POLICIES_KEY, handlers);
  ^^^^^^^^^^^^^^^^ ^^^^^^^^^^^^^^^^^^^ ^^^^^^^^
  |                |                   |
  |                Metadata-Schlüssel  Zu speichernder Wert (Array von Klassen)
  TypeScript Reflect Metadata API
```

### Reflect Metadata API

**Was ist Reflect.metadata?**

- Teil der TypeScript Reflection API
- Ermöglicht es, Metadaten an Klassen/Methoden/Properties anzuhängen
- Diese Metadaten können zur Laufzeit abgerufen werden
- Wird von NestJS extensiv verwendet (für Decorators wie `@Injectable`, `@Controller`, etc.)

### Rest-Parameter

**Warum `...handlers`?**

Ermöglicht flexible Anzahl von Policy-Klassen:

```typescript
@CheckPolicies(PolicyA)                    // 1 Policy
@CheckPolicies(PolicyA, PolicyB)           // 2 Policies
@CheckPolicies(PolicyA, PolicyB, PolicyC)  // 3 Policies
```

Intern wird daraus ein Array: `[PolicyA, PolicyB, PolicyC]`

### Verwendung

```typescript
@Controller('tickets')
export class TicketsController {
  @Patch(':id')
  @UseGuards(PoliciesGuard)
  @CheckPolicies(UpdateTicketPolicyHandler) // ← Metadaten werden hier gespeichert
  async update(@Param('id') id: string) {
    // ...
  }
}
```

### Ablauf

1. `@CheckPolicies` wird beim Start der Anwendung ausgeführt
2. `Reflect.metadata` speichert `[UpdateTicketPolicyHandler]` unter `'check_policies'`
3. Bei einem Request holt `PoliciesGuard` diese Metadaten ab
4. Guard instantiiert `UpdateTicketPolicyHandler` und ruft `handle()` auf

---

## PoliciesGuard Implementierung

### NestJS Guard Lifecycle

```
Request → Middleware → Guards → Interceptors (before) → Controller
                        ^^^^^^
                        Wir sind hier
```

Guards werden NACH Middleware aber VOR Interceptors ausgeführt. Perfekt für Authentifizierung und Autorisierung.

### Dependency Injection

```typescript
constructor(private reflector: Reflector, private moduleRef: ModuleRef) {}
```

**Wie funktioniert DI in NestJS?**

1. NestJS erkennt die Parameter im Constructor
2. Sucht die entsprechenden Provider im DI-Container
3. Instantiiert sie automatisch und übergibt sie

**Warum zwei verschiedene Services?**

| Service     | Zweck                                              |
| ----------- | -------------------------------------------------- |
| `Reflector` | Liest Metadaten (statische Informationen)          |
| `ModuleRef` | Holt Instanzen aus DI-Container (Laufzeit-Objekte) |

Beide zusammen ermöglichen dynamisches Policy-Loading.

### canActivate Methode

#### Schritt 1: Policy Handler Classes aus Metadaten holen

```typescript
const policyHandlers = this.reflector.get<PolicyHandlerClass[]>(CHECK_POLICIES_KEY, context.getHandler());
```

**Was passiert hier?**

1. `reflector.get()` sucht in den Metadaten der Controller-Methode
2. Sucht nach dem Schlüssel `'check_policies'`
3. Gibt den gespeicherten Wert zurück (Array von Policy-Klassen)
4. Wenn nichts gefunden → `undefined`

**Warum `context.getHandler()`?**

- `getHandler()` gibt die spezifische Controller-Methode zurück
- Jede Methode kann unterschiedliche Policies haben:
  - `update()` → `UpdateTicketPolicyHandler`
  - `delete()` → `DeleteTicketPolicyHandler`

**Alternative: `context.getClass()`**

- Würde Metadaten vom gesamten Controller lesen
- Weniger flexibel (alle Methoden hätten gleiche Policies)

**Beispiel:**

```typescript
// In TicketsController:
@CheckPolicies(UpdateTicketPolicyHandler, ProjectAccessPolicyHandler)
async update() { }

// Im Guard:
policyHandlers = [UpdateTicketPolicyHandler, ProjectAccessPolicyHandler]
```

#### Schritt 2: Request-Daten holen

```typescript
const request = context.switchToHttp().getRequest();
const user = request.user;
```

**ExecutionContext**

- Abstrakte Schicht über verschiedene Protokolle (HTTP, WebSockets, gRPC)
- `switchToHttp()` konvertiert zu HTTP-spezifischem Kontext
- Ermöglicht Zugriff auf Request/Response Objekte

**Request-Objekt enthält:**

- `request.user` → Gesetzt von `CurrentUserGuard`
- `request.params` → Route-Parameter (z.B. `:id`)
- `request.body` → Request-Body
- `request.headers` → HTTP Headers
- `request.query` → Query-String Parameter

**Guard Execution Order:**

1. `CurrentUserGuard` (Global) → Setzt `request.user`
2. `PoliciesGuard` (Route-Level) → Nutzt `request.user`

#### Schritt 3: Alle Policy Handler ausführen

**Warum `for...of` statt `forEach`?**

- `await` funktioniert in `for...of` (synchrone Ausführung)
- `forEach` würde alle Policies parallel ausführen
- Wir wollen sequentielle Ausführung (Stop bei erstem `false`)

**Policy Handler aus DI Container holen:**

```typescript
const handler = this.moduleRef.get(HandlerClass, { strict: false });
```

**Was macht `moduleRef.get()`?**

- Sucht im NestJS Dependency Injection Container
- Findet die registrierte Instanz von `HandlerClass`
- Gibt die Singleton-Instanz zurück
- Instantiiert sie bei Bedarf (inkl. deren Dependencies)

**Warum `{ strict: false }`?**

- `strict: true` → Sucht nur im aktuellen Module
- `strict: false` → Sucht in ALLEN Modulen (global)

Da Policies im `AuthModule` registriert sind (mit `@Global()`), müssen wir global suchen.

**Registrierung in auth.module.ts:**

```typescript
@Global()
@Module({
  providers: [
    UpdateTicketPolicyHandler,  // ← Hier registriert
    DeleteTicketPolicyHandler,
    // ...
  ],
  exports: [...]
})
```

**Dependency Injection Beispiel:**

```typescript
class UpdateTicketPolicyHandler {
  constructor(private prisma: PrismaService) {}
  //   ^^^^^^^^^^^^^^^^^^^^^^^^^^
  //   NestJS injiziert PrismaService automatisch
}

// moduleRef.get(UpdateTicketPolicyHandler) gibt Instanz zurück
// mit bereits injiziertem PrismaService!
```

**Policy ausführen:**

```typescript
const allowed = await handler.handle(user);
```

**Warum `await`?**

- `handler.handle()` kann `Promise<boolean>` oder `boolean` zurückgeben
- `await` funktioniert mit beiden:
  - `Promise<boolean>` → wartet auf Auflösung
  - `boolean` → gibt direkt zurück

**Performance-Überlegung:**

Policies werden SEQUENTIELL ausgeführt (nicht parallel).

Bei 3 Policies:

1. `Policy1.handle(user)` → await
2. `Policy2.handle(user)` → await
3. `Policy3.handle(user)` → await

**Vorteil:** Stop bei erstem `false` (Short-Circuit)  
**Nachteil:** Langsamer als parallel (aber meist nicht relevant)

**Zugriff verweigern:**

```typescript
if (!allowed) {
  throw new ForbiddenException(`Access denied: ${HandlerClass.name} policy failed`);
}
```

**Short-Circuit Beispiel:**

```typescript
@CheckPolicies(PolicyA, PolicyB, PolicyC)

PolicyA.handle() → true   ✅ Weiter zu PolicyB
PolicyB.handle() → false  ❌ STOP! ForbiddenException
PolicyC.handle() → (wird nicht ausgeführt)
```

---

## TypeScript Syntax Details

### PolicyHandlerClass Type

```typescript
type PolicyHandlerClass = new (...args: unknown[]) => IPolicyHandler;
```

**Syntax-Aufschlüsselung:**

```typescript
type PolicyHandlerClass = new (...args: unknown[]) => IPolicyHandler;
                          ^^^                        ^^
                          |                          |
                          Constructor-Signatur       Rückgabetyp

new (...args: unknown[]) => IPolicyHandler
^^^   ^^^^^^^^^^^^^^^^^^^    ^^^^^^^^^^^^^^
|     |                      |
|     |                      Erzeugt eine Instanz von IPolicyHandler
|     Rest-Parameter: Nimmt beliebig viele Argumente beliebigen Typs
Konstruktor (kann mit 'new' aufgerufen werden)
```

**Warum dieser Type?**

- NestJS benötigt die Klasse selbst (nicht eine Instanz)
- Wir übergeben `UpdateTicketPolicyHandler`, nicht `new UpdateTicketPolicyHandler()`
- Der DI-Container instantiiert die Klasse später

**Warum `unknown[]` statt `any[]`?**

- `unknown` ist type-safe: Erzwingt Type-Checking vor Verwendung
- `any` deaktiviert Type-Checking komplett
- Best Practice seit TypeScript 3.0

**Beispiel:**

```typescript
class UpdateTicketPolicyHandler implements IPolicyHandler {
  constructor(private prisma: PrismaService) {} // ← ...args kann diese Deps enthalten
  handle(user: User): boolean {
    return true;
  }
}

const PolicyClass: PolicyHandlerClass = UpdateTicketPolicyHandler; // ✅ Valid
const instance: PolicyHandlerClass = new UpdateTicketPolicyHandler(); // ❌ Typ-Fehler
```

### CHECK_POLICIES_KEY

```typescript
export const CHECK_POLICIES_KEY = 'check_policies';
```

**Warum `export const`?**

- `export`: Muss in anderen Dateien verwendbar sein (für Tests, andere Guards)
- `const`: Wert darf nie geändert werden (immutable)

**Warum ein String-Schlüssel?**

- TypeScript Reflect Metadata API verwendet String-Keys
- Ermöglicht es, beliebige Daten an Klassen/Methoden anzuhängen
- Wird zur Laufzeit verwendet (nicht nur compile-time)

---

## Dependency Injection Flow

### Vollständiger DI-Ablauf

```
1. Anwendungsstart
   ↓
2. NestJS scannt alle Module
   ↓
3. AuthModule registriert Policies als Provider
   ↓
4. Policies werden im DI-Container gespeichert
   ↓
5. HTTP Request kommt rein
   ↓
6. PoliciesGuard wird instantiiert (mit Reflector + ModuleRef)
   ↓
7. Guard holt Policy-Klassen aus Metadaten
   ↓
8. Guard holt Policy-Instanzen aus DI-Container (moduleRef.get)
   ↓
9. Policy-Instanzen haben bereits alle Dependencies injiziert
   ↓
10. Guard ruft policy.handle(user) auf
```

### Policy-Registrierung

**In auth.module.ts:**

```typescript
@Global()
@Module({
  providers: [
    // Policies
    UpdateTicketPolicyHandler,
    DeleteTicketPolicyHandler,
    CreateCommentPolicyHandler,
    // ... mehr Policies

    // Guards
    PoliciesGuard,
    CurrentUserGuard,
  ],
  exports: [
    // Policies müssen exportiert werden
    UpdateTicketPolicyHandler,
    DeleteTicketPolicyHandler,
    // ...
  ],
})
export class AuthModule {}
```

**Warum `@Global()`?**

- Macht das Modul global verfügbar
- Policies können in allen anderen Modulen verwendet werden
- Kein Import in jedem Modul nötig

---

## Best Practices

### 1. Error Handling

**Konfigurationsfehler vs. Runtime-Fehler:**

```typescript
// Konfigurationsfehler (sollte nie in Production passieren)
if (!handler) {
  throw new Error(`Policy handler ${HandlerClass.name} not found in DI container`);
}

// Runtime-Fehler (erwarteter Fehlerfall)
if (!allowed) {
  throw new ForbiddenException(`Access denied: ${HandlerClass.name} policy failed`);
}
```

**Production-optimiert:**

```typescript
if (!handler) {
  this.logger.error(`Policy ${HandlerClass.name} not found in DI`);
  throw new InternalServerErrorException('Authorization configuration error');
}

// Generische Message ohne interne Details
if (!allowed) {
  throw new ForbiddenException('Access denied');
}
```

### 2. HTTP Status Codes

| Code | Exception                      | Verwendung                                 |
| ---- | ------------------------------ | ------------------------------------------ |
| 401  | `UnauthorizedException`        | User ist nicht angemeldet                  |
| 403  | `ForbiddenException`           | User ist angemeldet, aber nicht berechtigt |
| 500  | `InternalServerErrorException` | Konfigurationsfehler                       |

### 3. Policy Design

**Eine Policy = Eine Verantwortung:**

```typescript
// ✅ Gut: Eine klare Verantwortung
class UpdateTicketPolicyHandler {
  handle(user: User): boolean {
    return user.role === 'MANAGER' || user.role === 'DEVELOPER';
  }
}

// ❌ Schlecht: Mehrere Verantwortungen gemischt
class TicketPolicyHandler {
  handle(user: User, action: string): boolean {
    if (action === 'update') {
      /* ... */
    }
    if (action === 'delete') {
      /* ... */
    }
    if (action === 'create') {
      /* ... */
    }
  }
}
```

### 4. Testing

**Policies isoliert testen:**

```typescript
describe('UpdateTicketPolicyHandler', () => {
  let handler: UpdateTicketPolicyHandler;

  beforeEach(() => {
    handler = new UpdateTicketPolicyHandler();
  });

  it('should allow MANAGER to update tickets', () => {
    const user = { role: 'MANAGER' } as User;
    expect(handler.handle(user)).toBe(true);
  });

  it('should deny VIEWER to update tickets', () => {
    const user = { role: 'VIEWER' } as User;
    expect(handler.handle(user)).toBe(false);
  });
});
```

### 5. Performance

**Optimierungen:**

1. **Early Return** bei fehlgeschlagenen Policies (Short-Circuit)
2. **Sequentielle Ausführung** (nicht parallel) für Short-Circuit
3. **Caching** in shared logic der Abstract Class (zukünftig)

### 6. Guard Response

**Guards können NICHT den Response modifizieren.**

```
Request → Guards ✅ → Interceptors (before) → Controller → Interceptors (after) → Response
                     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                     Ab hier normal weiter
```

Sie entscheiden nur:

- Durchlassen (`return true`)
- Blockieren (`return false` oder Exception werfen)

Für Response-Modifikation → Interceptors verwenden

---

## Zusammenfassung

Das Policy System nutzt:

- **TypeScript Patterns**: Interface + Abstract Class für Flexibilität
- **Reflect Metadata API**: Für Decorator-basierte Metadaten
- **NestJS DI**: Für automatische Instantiierung mit Dependencies
- **Guard Lifecycle**: Für rechtzeitige Autorisierungsprüfung
- **Separation of Concerns**: Berechtigungslogik außerhalb von Controllern

Diese Architektur ermöglicht:

- ✅ Wiederverwendbare, testbare Policies
- ✅ Einfache Erweiterung ohne Controller-Änderungen
- ✅ Type-Safe durch TypeScript
- ✅ Future-Proof für gemeinsame Logik (Logging, Caching, Audit)
