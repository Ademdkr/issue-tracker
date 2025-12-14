# Mapping-Strategie im Issue Tracker Backend

## Warum Mapping beibehalten?

### 1. **Separation of Concerns**

- **Prisma-Typen**: Repräsentieren die Datenbankstruktur
- **Shared-Types**: Repräsentieren den API-Contract
- **Mapping-Layer**: Entkoppelt DB von API

### 2. **Type-Safety**

```typescript
// ✅ MIT Mapping - Compiler erkennt Probleme
private mapPrismaToProject(prisma: PrismaProject): Project {
  return {
    ...prisma,
    status: prisma.status as Project['status'], // Explizites Casting
  };
}

// ❌ OHNE Mapping - Prisma-Objekt direkt zurückgeben
// Problem: Änderungen am Schema brechen die API ohne Compiler-Warnung
```

### 3. **API-Stabilität**

- DB-Schema kann sich ändern ohne API-Breaking-Changes
- Zusätzliche DB-Felder werden nicht automatisch exposed
- Buffer-Zone für Refactorings

### 4. **Security**

```typescript
// ✅ mapPrismaToUserPublic filtert explizit passwordHash
return {
  id: user.id,
  name: user.name,
  // passwordHash wird NICHT gemappt
};

// ❌ Ohne Mapping: Risiko, sensitive Daten zu leaken
```

### 5. **Computed Properties**

```typescript
// Frontend braucht fullName, DB speichert nur name + surname
fullName: `${user.name} ${user.surname}`.trim();

// labelIds Array statt nested ticketLabels Relation
labelIds: ticket.ticketLabels?.map((tl) => tl.labelId) || [];
```

## Aktuelle Mapping-Komplexität

| Service         | Zeilen | Komplexität | Hauptzweck                |
| --------------- | ------ | ----------- | ------------------------- |
| ProjectsService | 5      | Minimal     | Type-Cast für Enum        |
| TicketsService  | 16     | Moderat     | Nested Relations → IDs    |
| UsersService    | 9      | Gering      | Computed Field + Security |

## Best Practices

### ✅ Behalten:

- Enum Type-Casts (ProjectStatus, TicketStatus, etc.)
- Computed Properties (fullName)
- Nested Relations auflösen (ticketLabels → labelIds)
- Security-relevante Filterung (passwordHash)
- null → undefined Konvertierungen

### ❌ Vermeiden:

- Unnötige deep-cloning (wenn Spread ausreicht)
- Komplexe Business-Logic im Mapper (gehört in Service-Methoden)
- Duplikat-Mapper (DRY-Prinzip beachten)

## Optimierungsmöglichkeiten

1. **Generic Mapper-Utils** (falls Pattern wiederholt):

```typescript
// Könnte hilfreich sein wenn viele Services ähnlich mappen
function mapPrismaEnum<T>(value: string): T {
  return value as T;
}
```

2. **Zod/Class-Validator** für Runtime-Validation:

```typescript
// Zusätzliche Sicherheitsebene
const ProjectSchema = z.object({
  status: z.nativeEnum(ProjectStatus),
  // ...
});
```

3. **Mapper als separate Service-Klasse** (bei Wachstum):

```typescript
@Injectable()
export class ProjectMapperService {
  toDomain(prisma: PrismaProject): Project { ... }
  toDTO(domain: Project): ProjectDTO { ... }
}
```

## Fazit

**Das Mapping MUSS beibehalten werden** wegen:

- Type-Safety ✅
- Security ✅
- API-Stabilität ✅
- Klare Architektur ✅

Die aktuelle Implementierung ist angemessen und folgt Best Practices.
