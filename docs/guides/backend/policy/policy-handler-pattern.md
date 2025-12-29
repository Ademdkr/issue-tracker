# Policy Handler Pattern - Interface vs. Abstract Class

## Übersicht

Dieses Dokument erklärt das Design-Pattern hinter dem Policy Handler System und warum sowohl ein **Interface** als auch eine **Abstract Class** verwendet werden.

---

## 1. TypeScript-Pattern: Interface vs. Abstract Class

### Interface = Vertrag (Was muss implementiert werden)

Ein Interface ist wie ein **Vertrag** oder eine **Checkliste**:

> "Jede Klasse, die dieses Interface implementiert, MUSS diese Methoden haben"

**Beispiel:**

```typescript
interface IPolicyHandler {
  handle(user: User): boolean; // ← Nur Signatur, KEINE Implementierung
}
```

**Eigenschaften:**

- ✅ Definiert NUR die Struktur (Methodennamen, Parameter, Rückgabewerte)
- ❌ Enthält KEINE Implementierung (kein Code in den Methoden)
- ⚡ Wird zur Compile-Zeit geprüft, existiert NICHT zur Laufzeit
- 🔄 Kann von mehreren Klassen implementiert werden
- 📦 Klassen können mehrere Interfaces implementieren

**Verwendung:**

```typescript
class MyPolicy implements IPolicyHandler {
  handle(user: User): boolean {
    // ← Muss selbst implementieren
    return user.role === 'ADMIN';
  }
}
```

---

### Abstract Class = Basis-Implementierung (Wie kann es implementiert werden)

Eine Abstract Class ist wie eine **Vorlage** mit vorgefertigten Bausteinen:

> "Erbe von mir und nutze meine gemeinsame Logik, aber implementiere die abstrakten Methoden selbst"

**Beispiel:**

```typescript
abstract class PolicyHandler {
  // KONKRETE Methode - fertige Implementierung
  protected log(message: string): void {
    console.log(`[Policy] ${message}`);
  }

  // ABSTRAKTE Methode - muss von Kindklasse implementiert werden
  abstract handle(user: User): boolean;
}
```

**Eigenschaften:**

- ✅ Kann KONKRETE Methoden enthalten (mit Implementierung)
- ✅ Kann ABSTRAKTE Methoden enthalten (ohne Implementierung, wie Interface)
- ✅ Kann Instanz-Variablen haben (z.B. `private logger`)
- ✅ Kann Constructor haben
- ⚡ Existiert zur Laufzeit (kann mit `instanceof` geprüft werden)
- ⚠️ Klasse kann nur von EINER Abstract Class erben (keine Mehrfachvererbung)

**Verwendung:**

```typescript
class MyPolicy extends PolicyHandler {
  handle(user: User): boolean {
    this.log('Checking permissions...'); // ← Nutzt geerbte Methode
    return user.role === 'ADMIN';
  }
}
```

---

## 2. Vergleich: Interface vs. Abstract Class

| Feature                     | Interface                            | Abstract Class                                   |
| --------------------------- | ------------------------------------ | ------------------------------------------------ |
| **Methodenimplementierung** | ❌ NEIN (nur Signatur)               | ✅ JA (kann Code enthalten + abstrakte Methoden) |
| **Instanz-Variablen**       | ❌ NEIN                              | ✅ JA                                            |
| **Constructor**             | ❌ NEIN                              | ✅ JA                                            |
| **Mehrfachverwendung**      | ✅ JA (`implements A, B`)            | ❌ NEIN (nur `extends A`)                        |
| **Zur Laufzeit**            | ❌ NEIN (existiert nur compile-time) | ✅ JA (`instanceof` prüfbar)                     |
| **Zweck**                   | Vertrag definieren                   | Gemeinsame Logik bereitstellen                   |

---

## 3. Konkretes Beispiel: Warum beides nutzen?

### Aktueller Stand (nur Interface):

```typescript
// IPolicyHandler.ts
interface IPolicyHandler {
  handle(user: User): boolean;
}

// UpdateTicketPolicyHandler.ts
class UpdateTicketPolicyHandler implements IPolicyHandler {
  handle(user: User): boolean {
    // Logik für Ticket-Update
    return user.role === 'MANAGER';
  }
}

// DeleteProjectPolicyHandler.ts
class DeleteProjectPolicyHandler implements IPolicyHandler {
  handle(user: User): boolean {
    // Logik für Project-Delete
    return user.role === 'ADMIN';
  }
}
```

**❌ Problem:** Wenn wir Logging hinzufügen wollen, müssen wir JEDE Policy ändern!

---

### Mit Abstract Class (zukünftig erweiterbar):

```typescript
// PolicyHandler.ts (Abstract Class)
abstract class PolicyHandler implements IPolicyHandler {
  // GEMEINSAME LOGIK - in EINER Datei
  protected logger = new Logger(PolicyHandler.name);

  protected log(action: string, user: User, allowed: boolean): void {
    this.logger.log(`User ${user.email} ${allowed ? 'allowed' : 'denied'} for ${action}`);
  }

  // ABSTRAKTE Methode - muss implementiert werden
  abstract handle(user: User): boolean;
}

// UpdateTicketPolicyHandler.ts
class UpdateTicketPolicyHandler extends PolicyHandler {
  handle(user: User): boolean {
    const allowed = user.role === 'MANAGER';
    this.log('UPDATE_TICKET', user, allowed); // ← Nutzt geerbte Methode
    return allowed;
  }
}

// DeleteProjectPolicyHandler.ts
class DeleteProjectPolicyHandler extends PolicyHandler {
  handle(user: User): boolean {
    const allowed = user.role === 'ADMIN';
    this.log('DELETE_PROJECT', user, allowed); // ← Nutzt geerbte Methode
    return allowed;
  }
}
```

**✅ Vorteile:**

- Logging-Logik nur EINMAL in `PolicyHandler`
- Neue Policies bekommen Logging automatisch
- Änderungen am Logging betreffen alle Policies gleichzeitig
- **DRY-Prinzip** (Don't Repeat Yourself)

---

## 4. Warum BEIDE in policy-handler.interface.ts?

### 1. Interface (`IPolicyHandler`):

- Definiert den **VERTRAG** für den `PoliciesGuard`
- Guard erwartet: "Jedes Objekt mit `handle()` Methode"
- Wird für Dependency Injection verwendet

### 2. Abstract Class (`PolicyHandler`):

- Bietet **OPTIONALE** Basis-Implementierung
- Aktuell noch leer (nur `abstract handle`)
- Vorbereitet für zukünftige gemeinsame Logik

---

## 5. Flexibilität: Beide Ansätze funktionieren

```typescript
// ✅ Variante 1: Nur Interface nutzen
class SimplePolicy implements IPolicyHandler {
  handle(user: User): boolean {
    return user.role === 'ADMIN';
  }
}

// ✅ Variante 2: Abstract Class nutzen (profitiert von gemeinsamer Logik)
class AdvancedPolicy extends PolicyHandler {
  handle(user: User): boolean {
    this.log('...'); // ← Falls log() später hinzugefügt wird
    return user.role === 'ADMIN';
  }
}
```

**Beide funktionieren mit dem `PoliciesGuard`, weil:**

- `PolicyHandler` implementiert `IPolicyHandler`
- Guard akzeptiert alles, was `IPolicyHandler` implementiert

---

## 6. Mögliche zukünftige Erweiterungen

Die Abstract Class ermöglicht es, später gemeinsame Funktionalität hinzuzufügen, **ohne jede Policy einzeln anzupassen**:

### Logging

```typescript
abstract class PolicyHandler {
  protected logger = new Logger(PolicyHandler.name);

  protected log(action: string, allowed: boolean): void {
    this.logger.log(`Action: ${action}, Allowed: ${allowed}`);
  }
}
```

### Caching

```typescript
abstract class PolicyHandler {
  private cache = new Map<string, boolean>();

  protected getCached(key: string): boolean | undefined {
    return this.cache.get(key);
  }

  protected setCache(key: string, value: boolean): void {
    this.cache.set(key, value);
  }
}
```

### Audit Trail

```typescript
abstract class PolicyHandler {
  protected async audit(user: User, action: string, allowed: boolean): Promise<void> {
    await this.auditService.log({
      userId: user.id,
      action,
      allowed,
      timestamp: new Date(),
    });
  }
}
```

### Performance Monitoring

```typescript
abstract class PolicyHandler {
  protected async measure<T>(fn: () => T, label: string): Promise<T> {
    const start = performance.now();
    const result = await fn();
    const duration = performance.now() - start;
    this.logger.debug(`${label} took ${duration}ms`);
    return result;
  }
}
```

---

## 7. Zusammenfassung

| Aspekt         | Interface                    | Abstract Class                       |
| -------------- | ---------------------------- | ------------------------------------ |
| **Zweck**      | Vertrag definieren           | Gemeinsame Logik bereitstellen       |
| **Aktuell**    | Definiert `handle()` Methode | Leer, aber vorbereitet               |
| **Zukunft**    | Bleibt gleich                | Kann Logging, Caching, etc. bekommen |
| **Vorteil**    | Type-Safety, DI              | Code-Wiederverwendung, DRY           |
| **Verwendung** | `implements IPolicyHandler`  | `extends PolicyHandler`              |

**Best Practice:** Interface für den Vertrag, Abstract Class für gemeinsame Implementierung - genau wie in unserem Code! ✅

---

## 8. Weiterführende Ressourcen

- [TypeScript Handbook - Interfaces](https://www.typescriptlang.org/docs/handbook/2/objects.html#interfaces-vs-intersections)
- [TypeScript Handbook - Abstract Classes](https://www.typescriptlang.org/docs/handbook/2/classes.html#abstract-classes-and-members)
- [NestJS Guards Documentation](https://docs.nestjs.com/guards)
- [Design Patterns - Strategy Pattern](https://refactoring.guru/design-patterns/strategy)
