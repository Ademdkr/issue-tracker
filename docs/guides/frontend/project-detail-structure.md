# Project Detail View - Verzeichnisstruktur

## 📋 Übersicht

Dieses Dokument beschreibt die empfohlene Verzeichnisstruktur für die `/projects/:id` Detail-Ansicht.

Die Seite besteht aus zwei Haupt-Tabs:

1. **Tickets** - Ticket-Übersicht mit Filtern und Tabelle
2. **Verwaltung** - Projektmitglieder- und Label-Verwaltung

---

## 📁 Verzeichnisstruktur

```
apps/frontend/src/app/features/projects/
├── projects.ts                           # Liste aller Projekte
├── projects.html
├── projects.scss
│
├── project-detail/                       # Haupt-Detail-Seite
│   ├── project-detail.ts                 # Container mit Tabs
│   ├── project-detail.html
│   ├── project-detail.scss
│   │
│   └── components/                       # Tab-spezifische Komponenten
│       │
│       ├── tickets-tab/                  # Tab 1: Tickets
│       │   ├── tickets-tab.ts
│       │   ├── tickets-tab.html
│       │   ├── tickets-tab.scss
│       │   └── components/
│       │       ├── ticket-filters/       # Status, Priorität, Assignee, Label Filter
│       │       ├── ticket-table/         # Tickets-Tabelle
│       │       └── ticket-view-toggle/   # Grid/List Toggle
│       │
│       └── management-tab/               # Tab 2: Verwaltung
│           ├── management-tab.ts
│           ├── management-tab.html
│           ├── management-tab.scss
│           └── components/
│               ├── members-management/   # Verfügbare Nutzer + Projektmitglieder
│               │   ├── members-management.ts
│               │   ├── members-management.html
│               │   ├── members-management.scss
│               │   └── components/
│               │       ├── available-users-table/
│               │       └── project-members-table/
│               │
│               └── labels-management/    # Label-Verwaltung
│                   ├── labels-management.ts
│                   ├── labels-management.html
│                   └── labels-management.scss
│
└── components/                           # Wiederverwendbare Projekt-Komponenten
    ├── general-settings-form/
    ├── create-project-form/
    └── project-header/                   # Projekt-Titel + "Neues Ticket" Button
        ├── project-header.ts
        ├── project-header.html
        └── project-header.scss
```

---

## 🎯 Komponenten-Beschreibung

### **1. ProjectDetail (Container)**

**Pfad:** `project-detail/project-detail.ts`

**Verantwortlichkeiten:**

- Lädt Projekt-Daten via Route-Parameter (`:id`)
- Verwaltet Tab-State (Tickets / Verwaltung)
- Zeigt Project-Header mit Titel und "Neues Ticket erstellen" Button
- Rendert entsprechenden Tab-Content via Angular Material Tabs

**Dependencies:**

- `MatTabsModule`
- `ActivatedRoute` (für `:id` Parameter)
- `ProjectsService` (zum Laden der Projektdaten)

---

### **2. Tab: Tickets**

**Pfad:** `project-detail/components/tickets-tab/tickets-tab.ts`

**Verantwortlichkeiten:**

- Orchestriert Ticket-Filter, Suche und Tabelle
- Verwaltet Filter-State (Status, Priorität, Assignee, Label)
- Kommuniziert mit TicketsService

**Unterkomponenten:**

#### **2.1 TicketFilters**

**Pfad:** `tickets-tab/components/ticket-filters/`

- Dropdown-Filter für Status, Priorität, Assignee, Label
- Suchfeld
- Emittiert Filter-Änderungen an Parent

#### **2.2 TicketTable**

**Pfad:** `tickets-tab/components/ticket-table/`

- Zeigt Tickets in Tabellenform
- Spalten: Titel, Status, Priorität, Assignee, Labels, Erstellt von, Erstellt am, Aktualisiert am
- Pagination
- Click-Handler für Ticket-Details

#### **2.3 TicketViewToggle**

**Pfad:** `tickets-tab/components/ticket-view-toggle/`

- Toggle zwischen Grid- und List-Ansicht
- Icon-Buttons für beide Views

---

### **3. Tab: Verwaltung**

**Pfad:** `project-detail/components/management-tab/management-tab.ts`

**Verantwortlichkeiten:**

- Zeigt Members-Management und Labels-Management
- Layout mit zwei Hauptbereichen

**Unterkomponenten:**

#### **3.1 MembersManagement**

**Pfad:** `management-tab/components/members-management/`

**Verantwortlichkeiten:**

- Verwaltet Projektmitglieder
- Zwei-Spalten-Layout: Verfügbare Nutzer | Projektmitglieder
- Suchfunktion für Nutzer
- Hinzufügen/Entfernen von Mitgliedern

**Sub-Components:**

##### **3.1.1 AvailableUsersTable**

**Pfad:** `members-management/components/available-users-table/`

- Tabelle mit verfügbaren Nutzern (noch nicht im Projekt)
- Spalten: Name, E-Mail, Rolle
- "Hinzufügen" Button pro Zeile

##### **3.1.2 ProjectMembersTable**

**Pfad:** `members-management/components/project-members-table/`

- Tabelle mit aktuellen Projektmitgliedern
- Spalten: Name, E-Mail, Rolle
- "Entfernen" Button pro Zeile

#### **3.2 LabelsManagement**

**Pfad:** `management-tab/components/labels-management/`

**Verantwortlichkeiten:**

- Zeigt Liste aller Projekt-Labels
- CRUD-Operationen für Labels
- Label-Chips mit Farbe
- Edit/Delete Buttons pro Label
- "Neues Label erstellen" Button

---

### **4. Shared Components**

#### **4.1 ProjectHeader**

**Pfad:** `components/project-header/`

**Verantwortlichkeiten:**

- Zeigt Projekt-Titel und Beschreibung
- "Neues Ticket erstellen" Button (rechts oben)
- Wiederverwendbar auf allen Projekt-Detail-Seiten

---

## 🔧 Component-Generierung (Nx Commands)

```bash
# Haupt-Detail-Component
npx nx g @nx/angular:component features/projects/project-detail --standalone --skip-tests

# Tabs
npx nx g @nx/angular:component features/projects/project-detail/components/tickets-tab --standalone --skip-tests
npx nx g @nx/angular:component features/projects/project-detail/components/management-tab --standalone --skip-tests

# Tickets-Tab Components
npx nx g @nx/angular:component features/projects/project-detail/components/tickets-tab/components/ticket-filters --standalone --skip-tests
npx nx g @nx/angular:component features/projects/project-detail/components/tickets-tab/components/ticket-table --standalone --skip-tests
npx nx g @nx/angular:component features/projects/project-detail/components/tickets-tab/components/ticket-view-toggle --standalone --skip-tests

# Management-Tab Components
npx nx g @nx/angular:component features/projects/project-detail/components/management-tab/components/members-management --standalone --skip-tests
npx nx g @nx/angular:component features/projects/project-detail/components/management-tab/components/members-management/components/available-users-table --standalone --skip-tests
npx nx g @nx/angular:component features/projects/project-detail/components/management-tab/components/members-management/components/project-members-table --standalone --skip-tests
npx nx g @nx/angular:component features/projects/project-detail/components/management-tab/components/labels-management --standalone --skip-tests

# Shared Project-Header
npx nx g @nx/angular:component features/projects/components/project-header --standalone --skip-tests
```

---

## 🛣️ Routing-Konfiguration

```typescript
// apps/frontend/src/app/app.routes.ts
{
  path: 'projects',
  children: [
    {
      path: '',
      loadComponent: () =>
        import('./features/projects/projects').then(m => m.Projects),
      data: { title: 'Projekte', icon: 'folder' }
    },
    {
      path: ':id',
      loadComponent: () =>
        import('./features/projects/project-detail/project-detail')
          .then(m => m.ProjectDetail),
      data: { title: 'Projekt-Details', icon: 'folder_open' }
    }
  ]
}
```

---

## 📊 Datenfluss-Hierarchie

```
ProjectDetail (Container)
    ↓
    ├─ ProjectHeader
    │   └─ "Neues Ticket erstellen" Button
    │
    └─ MatTabGroup
        │
        ├─ Tab 1: TicketsTab
        │   ├─ TicketFilters
        │   │   ├─ Status Dropdown
        │   │   ├─ Priorität Dropdown
        │   │   ├─ Assignee Dropdown
        │   │   ├─ Label Dropdown
        │   │   └─ Suchfeld
        │   │
        │   ├─ TicketViewToggle
        │   │   ├─ Grid View Button
        │   │   └─ List View Button
        │   │
        │   └─ TicketTable
        │       ├─ Ticket Rows
        │       └─ Paginator
        │
        └─ Tab 2: ManagementTab
            │
            ├─ MembersManagement
            │   ├─ Suchfeld
            │   ├─ AvailableUsersTable
            │   │   └─ "Hinzufügen" Buttons
            │   │
            │   ├─ Transfer Buttons (→ / ←)
            │   │
            │   └─ ProjectMembersTable
            │       └─ "Entfernen" Buttons
            │
            └─ LabelsManagement
                ├─ Label Chips (mit Edit/Delete)
                └─ "Neues Label erstellen" Button
```

---

## 🎨 Benötigte Angular Material Modules

```typescript
// Imports für project-detail Module
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
```

---

## 🔄 Services (benötigt)

### **1. ProjectsService**

- `findOne(id: string): Observable<Project>` - Lädt Projekt-Details

### **2. TicketsService**

- `findAllByProject(projectId: string, filters?: TicketFilters): Observable<Ticket[]>` - Lädt Projekt-Tickets
- `create(projectId: string, ticket: CreateTicketDto): Observable<Ticket>` - Erstellt neues Ticket

### **3. ProjectMembersService** (neu erstellen)

- `findAvailableUsers(projectId: string): Observable<User[]>` - Verfügbare Nutzer
- `findProjectMembers(projectId: string): Observable<User[]>` - Projekt-Mitglieder
- `addMember(projectId: string, userId: string): Observable<void>` - Mitglied hinzufügen
- `removeMember(projectId: string, userId: string): Observable<void>` - Mitglied entfernen

### **4. LabelsService**

- `findAllByProject(projectId: string): Observable<Label[]>` - Projekt-Labels
- `create(projectId: string, label: CreateLabelDto): Observable<Label>` - Label erstellen
- `update(projectId: string, labelId: string, label: UpdateLabelDto): Observable<Label>` - Label bearbeiten
- `delete(projectId: string, labelId: string): Observable<void>` - Label löschen

---

## ✅ Vorteile dieser Struktur

- ✅ **Klare Trennung**: Jeder Tab hat seine eigene Component
- ✅ **Wiederverwendbar**: Sub-Components können isoliert entwickelt/getestet werden
- ✅ **Testbar**: Kleine, fokussierte Components mit klaren Verantwortlichkeiten
- ✅ **Lazy Loading**: Tab-Content wird nur bei Bedarf geladen
- ✅ **Skalierbar**: Einfach weitere Tabs/Features hinzufügen
- ✅ **Material Design**: Nutzt Angular Material Best Practices
- ✅ **Nx-konform**: Folgt Nx Workspace-Konventionen
- ✅ **Standalone Components**: Moderne Angular-Architektur

---

## 📝 Implementierungs-Reihenfolge

1. **ProjectDetail Container** - Grundgerüst mit Tabs
2. **ProjectHeader** - Shared Component für Titel + Button
3. **TicketsTab** - Grundstruktur ohne Unterkomponenten
4. **TicketFilters** - Filter-UI
5. **TicketTable** - Tabelle mit Pagination
6. **TicketViewToggle** - View-Switcher
7. **ManagementTab** - Layout für beide Bereiche
8. **MembersManagement** - Mitglieder-Verwaltung mit Tabellen
9. **LabelsManagement** - Label-CRUD

---

## 🔗 Verwandte Dokumente

- `SETUP_ANLEITUNG.md` - Projekt-Setup und Installation
- `AGENTS.md` - Nx-spezifische Konfiguration
- Backend API Dokumentation (falls vorhanden)

---

**Erstellt am:** 9. Dezember 2025  
**Branch:** `feature/projects-detail-view-integration`  
**Autor:** AI Assistant
