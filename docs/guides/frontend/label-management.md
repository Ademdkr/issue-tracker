# Label Management - Implementierung

**Status: ✅ Implementiert am 13. Dezember 2025**

## Überblick

Die Label-Verwaltung ermöglicht es Projekt-Admins, Labels für Tickets zu erstellen, zu bearbeiten und zu löschen. Labels können mit Namen und Farben versehen werden und dienen zur Kategorisierung von Tickets.

## Features

- ✅ **Label-Liste**: Übersicht aller Labels eines Projekts (nebeneinander, kompakt)
- ✅ **Label erstellen**: Dialog zum Erstellen neuer Labels mit Name und Farbe
- ✅ **Label bearbeiten**: Bestehende Labels anpassen
- ✅ **Label löschen**: Labels mit Bestätigungsdialog entfernen
- ✅ **Farbauswahl**: 16 vordefinierte Farben zur Auswahl
- ✅ **Vorschau**: Live-Vorschau des Labels im Dialog
- ✅ **Lowercase-Darstellung**: Label-Namen werden klein geschrieben
- ✅ **Integrierte Buttons**: Edit/Delete Buttons direkt im Label-Chip
- ✅ **Responsive Design**: Funktioniert auf Desktop und Mobile

---

## Architektur

```
management-tab
  └── manage-labels
      ├── Label-Liste mit Chips
      ├── Create/Edit/Delete Actions
      └── label-dialog (Modal)
          ├── Name Input
          ├── Farbauswahl (Grid)
          └── Vorschau
```

**Datenfluss:**

1. `manage-labels` lädt Labels vom Backend
2. User klickt "Neues Label erstellen" → Dialog öffnet sich
3. User füllt Formular aus und speichert
4. Dialog schließt mit Success-Flag
5. `manage-labels` lädt Labels neu

---

## Komponenten-Struktur

### 1. manage-labels Component

**Datei:** `manage-labels.ts`

**Verantwortlichkeiten:**

- Labels vom Backend laden
- Dialog für Create/Edit öffnen
- Labels löschen mit Bestätigung
- Liste der Labels anzeigen

**Key Properties:**

```typescript
@Input() projectId!: string;
labels: Label[] = [];
isLoading = false;
```

**Key Methods:**

```typescript
loadLabels(): void                    // Lädt alle Labels des Projekts
openCreateDialog(): void              // Öffnet Dialog für neues Label
openEditDialog(label: Label): void    // Öffnet Dialog zum Bearbeiten
deleteLabel(label: Label): void       // Löscht Label mit Bestätigung
```

### 2. label-dialog Component

**Datei:** `label-dialog.ts`

**Verantwortlichkeiten:**

- Formular für Label-Name und -Farbe
- Validierung (Name required, max 50 Zeichen)
- Live-Vorschau des Labels
- Create/Update Operation

**Dialog-Daten:**

```typescript
interface DialogData {
  projectId: string;
  label?: Label; // Optional für Edit-Modus
}
```

**FormGroup:**

```typescript
labelForm = FormGroup({
  name: FormControl<string>, // required, maxLength: 50
  color: FormControl<string>, // required
});
```

**Predefined Colors:**
16 Material Design Farben:

- Red, Pink, Purple, Deep Purple
- Indigo, Blue, Light Blue, Cyan
- Teal, Green, Light Green, Lime
- Yellow, Amber, Orange, Deep Orange

---

## Backend Integration

### ProjectsService Methoden

**Datei:** `projects.service.ts`

```typescript
// Labels abrufen
findProjectLabels(projectId: string): Observable<Label[]>

// Label erstellen
createLabel(
  projectId: string,
  data: { name: string; color: string }
): Observable<Label>

// Label bearbeiten
updateLabel(
  projectId: string,
  labelId: string,
  data: { name?: string; color?: string }
): Observable<Label>

// Label löschen
deleteLabel(projectId: string, labelId: string): Observable<void>
```

**API Endpoints:**

- `GET /projects/:projectId/labels` - Liste aller Labels
- `POST /projects/:projectId/labels` - Neues Label erstellen
- `PATCH /projects/:projectId/labels/:labelId` - Label bearbeiten
- `DELETE /projects/:projectId/labels/:labelId` - Label löschen

---

## Template-Struktur

### manage-labels.html

```html
<div class="manage-labels-container">
  <!-- Header mit Titel und Create-Button -->
  <div class="header">
    <h3>Verwaltung der Labels</h3>
    <button mat-raised-button (click)="openCreateDialog()">
      <mat-icon>add</mat-icon>
      Neues Label erstellen
    </button>
  </div>

  <!-- Labels-Liste (Grid Layout) -->
  <div class="labels-list">
    @if (isLoading) {
    <p class="loading-message">Lade Labels...</p>
    } @else if (labels.length === 0) {
    <p class="empty-message">Keine Labels vorhanden.</p>
    } @else { @for (label of labels; track label.id) {
    <!-- Label Chip mit integrierten Buttons -->
    <div class="label-chip" [style.background-color]="label.color">
      <span class="label-name">{{ label.name }}</span>
      <div class="label-actions">
        <button mat-icon-button (click)="openEditDialog(label)" class="action-btn">
          <mat-icon>edit</mat-icon>
        </button>
        <button mat-icon-button (click)="deleteLabel(label)" class="action-btn">
          <mat-icon>close</mat-icon>
        </button>
      </div>
    </div>
    } }
  </div>
</div>
```

### label-dialog.html

```html
<h2 mat-dialog-title>{{ title }}</h2>

<mat-dialog-content>
  <form [formGroup]="labelForm">
    <!-- Name Input -->
    <mat-form-field>
      <mat-label>Name</mat-label>
      <input matInput formControlName="name" maxlength="50" />
      <mat-error>Validierungsfehler</mat-error>
    </mat-form-field>

    <!-- Farbauswahl Grid -->
    <div class="color-grid">
      @for (color of predefinedColors; track color) {
      <button type="button" [class.selected]="labelForm.get('color')?.value === color" [style.background-color]="color" (click)="onColorSelect(color)"></button>
      }
    </div>

    <!-- Vorschau -->
    <div class="preview-chip" [style.background-color]="...">{{ labelForm.get('name')?.value || 'Label Name' }}</div>
  </form>
</mat-dialog-content>

<mat-dialog-actions>
  <button mat-button (click)="onCancel()">Abbrechen</button>
  <button mat-raised-button (click)="onSubmit()">{{ isEditMode ? 'Speichern' : 'Erstellen' }}</button>
</mat-dialog-actions>
```

---

## Styling

### manage-labels.scss

**Key Styles:**

- `.header`: Flexbox mit space-between für Titel und Button
- `.labels-list`: **Flex-Wrap Grid** - Labels nebeneinander statt untereinander
- `.label-chip`: Kompakter Chip mit integrierten Buttons
  - `text-transform: lowercase` - Label-Namen immer klein geschrieben
  - `padding: 6px 8px 6px 14px` - Kompakte Maße
  - `border-radius: 16px` - Abgerundete Ecken
- `.label-name`: Lowercase-Transformation, user-select: none
- `.label-actions`: Buttons direkt im Chip (gap: 2px)
- `.action-btn`: Kleinere Icons (18px) mit Hover-Effekt
- Hover-Effekt: `filter: brightness(0.9)`, Transform & Box-Shadow
- Responsive: Gleiche Darstellung auf allen Bildschirmgrößen

### label-dialog.scss

**Key Styles:**

- `.color-grid`: 8-Column Grid für Desktop, 4-Column für Mobile
- `.color-option`: Runde Buttons (border-radius: 50%)
- `.selected`: Border mit Scale-Effekt
- `.preview-chip`: Gleicher Style wie in Liste
- Transitions für smooth Interactions

---

## Verwendung

### Integration in Management Tab

**management-tab.html:**

```html
<div class="management-tab-container">
  <app-manage-members [projectId]="projectId"></app-manage-members>
  <app-manage-labels [projectId]="projectId"></app-manage-labels>
</div>
```

**Wichtig:** ProjectId wird als Input übergeben!

### Neues Label erstellen

1. Klick auf "Neues Label erstellen"
2. Dialog öffnet sich
3. Name eingeben (max. 50 Zeichen) - wird automatisch lowercase dargestellt
4. Farbe aus Grid auswählen
5. Vorschau prüfen
6. "Erstellen" klicken
7. Dialog schließt, Liste wird neu geladen

### Label bearbeiten

1. Hover über Label-Chip - Hover-Effekt zeigt sich
2. Klick auf Edit-Icon (Stift) **innerhalb des Label-Chips**
3. Dialog öffnet sich mit vorausgefüllten Werten
4. Name und/oder Farbe ändern
5. "Speichern" klicken
6. Dialog schließt, Liste wird neu geladen

### Label löschen

1. Hover über Label-Chip
2. Klick auf Delete-Icon (X) **innerhalb des Label-Chips**
3. Bestätigungsdialog erscheint
4. "OK" klicken zum Bestätigen
5. Label wird gelöscht, Liste wird neu geladen

---

## Validierung

### Name

- **Required**: Muss ausgefüllt sein
- **MaxLength**: Maximal 50 Zeichen
- Fehlermeldungen werden unter Input angezeigt

### Farbe

- **Required**: Muss ausgewählt sein
- Default: Erste Farbe im Grid (Red)

### Submit Button

- Deaktiviert wenn:
  - Formular invalid
  - Submission läuft (isSubmitting)

---

## Error Handling

**Console-Logging:**

- `loadLabels()`: Console.error bei Fehler
- `deleteLabel()`: Console.error bei Fehler
- `onSubmit()`: Console.error bei Fehler

**User Feedback:**

- Loading State: "Lade Labels..." während Request
- Empty State: "Keine Labels vorhanden" wenn leer
- Delete Confirmation: Browser-Alert mit Label-Name

**Zukünftige Verbesserungen:**

- Toast-Notifications mit MatSnackBar
- Loading Spinner im Dialog
- Error Messages im Dialog

---

## Material Modules

**Verwendete Module:**

- `MatButtonModule` - Buttons
- `MatIconModule` - Icons (add, edit, close)
- `MatDialogModule` - Modal Dialog
- `MatChipsModule` - Label Chips
- `MatFormFieldModule` - Form Fields
- `MatInputModule` - Text Inputs
- `ReactiveFormsModule` - Reactive Forms

---

## Testing Checklist

### Basis-Funktionalität

- [x] Labels werden geladen und angezeigt
- [x] "Neues Label erstellen" öffnet Dialog
- [x] Dialog zeigt leeres Formular
- [x] Name Input funktioniert
- [x] Farbauswahl funktioniert
- [x] Vorschau zeigt korrekte Farbe und Name
- [x] "Erstellen" erstellt Label und schließt Dialog
- [x] Liste wird nach Create neu geladen

### Edit-Funktionalität

- [x] Edit-Icon öffnet Dialog mit Label-Daten
- [x] Dialog zeigt vorausgefüllte Werte
- [x] Änderungen werden gespeichert
- [x] Liste wird nach Edit neu geladen

### Delete-Funktionalität

- [x] Delete-Icon zeigt Bestätigungsdialog
- [x] "OK" löscht Label
- [x] "Abbrechen" bricht ab
- [x] Liste wird nach Delete neu geladen

### Validierung

- [x] Leerer Name zeigt Fehler
- [x] Name > 50 Zeichen zeigt Fehler
- [x] Submit-Button deaktiviert bei Fehler
- [x] Farbe ist required

### Edge Cases

- [x] Projekt ohne Labels zeigt Empty State
- [x] Dialog kann mit "Abbrechen" geschlossen werden
- [x] Loading State während Requests
- [x] Keine TypeScript-Errors

### Responsive

- [x] Desktop: 8-Column Color Grid
- [x] Mobile: 4-Column Color Grid
- [x] Button-Layout passt sich an

---

## Bekannte Einschränkungen

1. **Confirmation Dialog**: Verwendet Browser-Alert statt Material Dialog
2. **Error Feedback**: Fehler nur in Console, keine User-sichtbaren Messages
3. **Loading States**: Kein Spinner im Dialog während Submit

---

## Erweiterungsmöglichkeiten

### 1. Custom Color Picker

Statt nur vordefinierte Farben könnte ein Hex-Input hinzugefügt werden:

```html
<mat-form-field>
  <mat-label>Benutzerdefinierte Farbe</mat-label>
  <input matInput formControlName="color" type="color" />
</mat-form-field>
```

### 2. Label Icon/Emoji

Labels könnten zusätzlich ein Icon oder Emoji haben:

```typescript
labelForm = this.fb.group({
  name: ['', Validators.required],
  color: ['#f44336', Validators.required],
  icon: [''], // Optional
});
```

### 3. Label Usage Counter

Anzeige wie viele Tickets ein Label verwenden:

```html
<div class="label-item">
  <mat-chip>{{ label.name }}</mat-chip>
  <span class="usage-count">{{ label.ticketCount }} Tickets</span>
  <div class="actions">...</div>
</div>
```

### 4. Batch Operations

Mehrere Labels gleichzeitig löschen:

- Checkboxen für Labels
- "Ausgewählte löschen" Button
- Confirmation mit Anzahl

### 5. Label Sorting

Labels sortieren nach:

- Name (alphabetisch)
- Farbe (Hue)
- Verwendung (meist genutzt zuerst)
- Erstellungsdatum

### 6. Search/Filter

Suchfeld zum Filtern der Label-Liste bei vielen Labels

---

## Implementierte Dateien

```
apps/frontend/src/app/
├── core/services/
│   └── projects.service.ts (+ Label CRUD Methoden)
└── features/projects/project-detail/
    └── components/management-tab/
        ├── management-tab.html (+ manage-labels Integration)
        ├── management-tab.scss (+ Layout Styling)
        └── components/
            └── manage-labels/
                ├── manage-labels.ts ✨ NEU
                ├── manage-labels.html ✨ NEU
                ├── manage-labels.scss ✨ NEU
                └── components/
                    └── label-dialog/
                        ├── label-dialog.ts ✨ NEU
                        ├── label-dialog.html ✨ NEU
                        └── label-dialog.scss ✨ NEU
```

---

## Zusammenfassung

Die Label-Management-Implementierung bietet:

- ✅ Vollständige CRUD-Operationen für Labels
- ✅ Benutzerfreundlicher Dialog mit Vorschau
- ✅ 16 vordefinierte Material-Farben
- ✅ **Kompakte Grid-Darstellung** - Labels nebeneinander statt untereinander
- ✅ **Lowercase-Transformation** - Label-Namen werden automatisch klein geschrieben
- ✅ **Integrierte Action-Buttons** - Edit/Delete direkt im Label-Chip
- ✅ **Hover-Effekte** - Visuelles Feedback mit Filter & Transform
- ✅ Responsive Design für alle Bildschirmgrößen
- ✅ Integration in Management Tab
- ✅ Type-safe mit shared-types
- ✅ Reactive Forms mit Validierung
- ✅ Material Design konform

**Implementierungszeit:** ~60 Minuten + 15 Minuten UI-Optimierung
**LOC:** ~450 Zeilen (TypeScript + HTML + SCSS)
