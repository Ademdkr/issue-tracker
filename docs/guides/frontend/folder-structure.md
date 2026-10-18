# Frontend-Struktur

Die Anwendung gliedert sich in `core`, `features` und `shared`.

- `core/`: Layout, Authentifizierung, Guards, Interceptors und gemeinsam genutzte API-Services
- `features/`: Ansichten und Komponenten für Auth, Dashboard, Projekte und Tickets
- `shared/components/`: allgemeine Dialoge und wiederverwendbare UI-Bausteine

Unter `features/projects/components/` liegen Projektformulare, Management- und
Ticket-Tabs, Label-/Mitgliederverwaltung sowie Ticket-Tabelle, Filter und Ansichten
als nebeneinanderliegende Komponentenordner. Jeder Ordner enthält TypeScript,
Template und Styles. `project-detail/` setzt diese Komponenten zusammen.

Eine Komponente wird nicht allein deshalb unter einer anderen Komponente
verschachtelt, weil sie in deren Template verwendet wird. Fachlich nahe
Komponenten bleiben im selben Feature. Featureübergreifend verwendete Services
bleiben zentral, um zyklische Feature-Abhängigkeiten zu vermeiden.

Weitere Informationen: [Frontend-README](../../../apps/frontend/README.md).
