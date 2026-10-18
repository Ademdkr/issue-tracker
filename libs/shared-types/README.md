# @issue-tracker/shared-types

Gemeinsame API-Verträge für Frontend und Backend. Öffentlicher Einstieg:
`src/index.ts`; Import ausschließlich über `@issue-tracker/shared-types`.

```text
src/lib/
  api/         API-Antworttypen
  dtos/        Request-DTOs und Validierung
  enums/       Gemeinsame Fachbegriffe und Statuswerte
  models/      Datenmodelle
  constants/   API-Konstanten und Grenzen
```

UI-Formatierung, Farben und Komponentenlogik gehören ins Frontend. Nicht
verwendete Legacy-Typen und Hilfsfunktionen wurden entfernt. Backend und Frontend
verwenden weiterhin dieselben DTOs und Enums.

Prüfen ab dem Hauptverzeichnis:

```sh
npm exec nx build shared-types
npm exec nx lint shared-types
```

[Dokumentation](../../docs/README.md)
