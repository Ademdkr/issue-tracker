# 🎨 Angular Material Setup - Dokumentation

Diese Anleitung dokumentiert die vollständige Einrichtung von Angular Material im Issue Tracker Frontend.

---

## 📋 Übersicht

Angular Material wurde erfolgreich im Frontend-Projekt eingerichtet mit:

- ✅ **Angular Material** v20.2.x
- ✅ **Angular CDK** v20.2.x
- ✅ **Angular Animations** v20.3.0
- ✅ **Custom Material Theme** (Indigo/Pink)
- ✅ **Roboto Font** (Google Fonts)
- ✅ **Material Icons** (Google Fonts)
- ✅ **Animations** (provideAnimationsAsync)

---

## 🚀 Durchgeführte Schritte

### **Schritt 1: Dependencies installiert**

```bash
npm install @angular/material@^20.2.0 @angular/cdk@^20.2.0 --legacy-peer-deps
npm install @angular/animations@~20.3.0 --legacy-peer-deps
```

**Installierte Packages:**

- `@angular/material` - Material Design Komponenten
- `@angular/cdk` - Component Dev Kit (Grundlage für Material)
- `@angular/animations` - Animationen für Material Komponenten

---

### **Schritt 2: Material Theme konfiguriert**

**Datei:** `apps/frontend/src/styles.scss`

```scss
// Import Material theming functions
@use '@angular/material' as mat;

// Include core Material styles
@include mat.core();

// Define custom color palettes
$issue-tracker-primary: mat.m2-define-palette(mat.$m2-indigo-palette);
$issue-tracker-accent: mat.m2-define-palette(mat.$m2-pink-palette, A200, A100, A400);
$issue-tracker-warn: mat.m2-define-palette(mat.$m2-red-palette);

// Create light theme
$issue-tracker-theme: mat.m2-define-light-theme(
  (
    color: (
      primary: $issue-tracker-primary,
      accent: $issue-tracker-accent,
      warn: $issue-tracker-warn,
    ),
    typography: mat.m2-define-typography-config(),
    density: 0,
  )
);

// Apply theme to all components
@include mat.all-component-themes($issue-tracker-theme);
```

**Theme-Farben:**

- **Primary:** Indigo (Hauptfarbe für Buttons, Links, etc.)
- **Accent:** Pink (Akzentfarbe für Highlights)
- **Warn:** Red (Warnungen, Fehler, Löschen-Aktionen)

---

### **Schritt 3: Animations Provider hinzugefügt**

**Datei:** `apps/frontend/src/app/app.config.ts`

```typescript
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

export const appConfig: ApplicationConfig = {
  providers: [
    // ... andere Providers
    provideAnimationsAsync(), // ← Neu hinzugefügt
  ],
};
```

**Warum `provideAnimationsAsync()`?**

- Lädt Animationen asynchron (kleineres Initial Bundle)
- Bessere Performance beim App-Start
- Material Komponenten benötigen Animations-Module

---

### **Schritt 4: Typography und Icons eingerichtet**

**Datei:** `apps/frontend/src/index.html`

```html
<head>
  <!-- Google Fonts - Roboto -->
  <link rel="preconnect" href="https://fonts.gstatic.com" />
  <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet" />

  <!-- Material Icons -->
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
</head>
```

**Was wurde hinzugefügt:**

- **Roboto Font** - Standard-Schriftart für Material Design
- **Material Icons** - Icon-Set für Material Komponenten

---

## 📦 Verwendung von Material Komponenten

### **Beispiel: Material Button**

```typescript
// 1. Import in Component
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [MatButtonModule], // ← Import hinzufügen
  template: ` <button mat-raised-button color="primary">Klick mich</button> `,
})
export class ExampleComponent {}
```

### **Beispiel: Material Card**

```typescript
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-project-card',
  standalone: true,
  imports: [MatCardModule],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Projekt-Titel</mat-card-title>
        <mat-card-subtitle>Projekt-Beschreibung</mat-card-subtitle>
      </mat-card-header>
      <mat-card-content>
        <p>Projekt-Details hier...</p>
      </mat-card-content>
      <mat-card-actions>
        <button mat-button>Öffnen</button>
        <button mat-button>Bearbeiten</button>
      </mat-card-actions>
    </mat-card>
  `,
})
export class ProjectCardComponent {}
```

### **Beispiel: Material Form Fields**

```typescript
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule],
  template: `
    <mat-form-field appearance="outline">
      <mat-label>Email</mat-label>
      <input matInput type="email" formControlName="email" />
      <mat-error *ngIf="emailControl.hasError('required')"> Email ist erforderlich </mat-error>
    </mat-form-field>
  `,
})
export class LoginFormComponent {}
```

---

## 🎨 Verfügbare Material Komponenten

### **Layout Komponenten:**

- `MatToolbarModule` - Toolbar/Header
- `MatSidenavModule` - Sidebar/Navigation
- `MatGridListModule` - Grid Layout
- `MatCardModule` - Cards
- `MatDividerModule` - Trennlinien

### **Form Komponenten:**

- `MatFormFieldModule` - Form Fields
- `MatInputModule` - Text Inputs
- `MatSelectModule` - Dropdowns
- `MatCheckboxModule` - Checkboxen
- `MatRadioModule` - Radio Buttons
- `MatDatepickerModule` - Datepicker
- `MatSlideToggleModule` - Toggle Switches

### **Navigation Komponenten:**

- `MatMenuModule` - Dropdown Menüs
- `MatTabsModule` - Tabs
- `MatStepperModule` - Stepper/Wizard

### **Buttons & Indicators:**

- `MatButtonModule` - Buttons
- `MatIconModule` - Icons
- `MatBadgeModule` - Badges
- `MatChipsModule` - Chips/Tags
- `MatProgressSpinnerModule` - Loading Spinner
- `MatProgressBarModule` - Progress Bar

### **Datentabellen:**

- `MatTableModule` - Datentabellen
- `MatPaginatorModule` - Pagination
- `MatSortModule` - Sortierung

### **Popups & Modals:**

- `MatDialogModule` - Dialoge/Modals
- `MatSnackBarModule` - Toast Notifications
- `MatTooltipModule` - Tooltips

---

## 🎯 Wichtige Material-Module für Issue Tracker

Für den Issue Tracker werden folgende Module häufig benötigt:

```typescript
// Shared Material Modules (für viele Components)
export const MATERIAL_MODULES = [MatButtonModule, MatIconModule, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatTableModule, MatPaginatorModule, MatSortModule, MatDialogModule, MatSnackBarModule, MatChipsModule, MatMenuModule, MatToolbarModule, MatSidenavModule, MatListModule, MatBadgeModule, MatTooltipModule, MatProgressSpinnerModule];
```

**Tipp:** Erstelle eine `shared-material.module.ts` oder barrel-export für häufig verwendete Module.

---

## 🔧 Theme Anpassungen

### **Custom Colors definieren**

In `styles.scss` kannst du eigene Farben definieren:

```scss
// Custom Palette erstellen
$custom-primary: (
  50: #e3f2fd,
  100: #bbdefb,
  200: #90caf9,
  // ... weitere Farben
  contrast:
    (
      50: rgba(black, 0.87),
      100: rgba(black, 0.87),
      // ... Kontrast-Farben
    ),
);

$my-primary: mat.m2-define-palette($custom-primary, 500);
```

### **Dark Theme erstellen**

```scss
// Dark Theme definieren
$dark-theme: mat.m2-define-dark-theme(
  (
    color: (
      primary: $issue-tracker-primary,
      accent: $issue-tracker-accent,
      warn: $issue-tracker-warn,
    ),
  )
);

// Dark Theme anwenden
.dark-theme {
  @include mat.all-component-colors($dark-theme);
}
```

**Verwendung im HTML:**

```html
<body class="dark-theme">
  <app-root></app-root>
</body>
```

---

## 📱 Responsive Design mit Material

Material Components sind standardmäßig responsive. Zusätzliche Features:

### **Breakpoint Observer**

```typescript
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

export class ResponsiveComponent {
  isMobile$ = this.breakpointObserver.observe([Breakpoints.Handset]).pipe(map((result) => result.matches));

  constructor(private breakpointObserver: BreakpointObserver) {}
}
```

### **Flex Layout (CDK)**

```html
<div style="display: flex; gap: 16px;">
  <mat-card style="flex: 1;">Card 1</mat-card>
  <mat-card style="flex: 1;">Card 2</mat-card>
</div>
```

---

## ✅ Build-Status

**Letzter erfolgreicher Build:**

```
✔ Building...
Initial chunk files   | Names         |  Raw size | Estimated transfer size
main-SUJISXOB.js      | main          | 115.75 kB |                29.53 kB
chunk-MGFFAJ2W.js     | -             | 106.95 kB |                31.85 kB
styles-INIVEQWO.css   | styles        |  96.23 kB |                 7.06 kB
polyfills-5CFQRCPP.js | polyfills     |  34.59 kB |                11.33 kB

                      | Initial total | 353.51 kB |                79.77 kB
```

**Frontend ist bereit für Material Komponenten! ✅**

---

## 🐛 Troubleshooting

### **Problem: "Could not resolve @angular/animations/browser"**

**Lösung:**

```bash
npm install @angular/animations@~20.3.0 --legacy-peer-deps
```

---

### **Problem: Material Styles werden nicht angewendet**

**Checklist:**

1. ✅ `styles.scss` importiert `@angular/material`?
2. ✅ `@include mat.all-component-themes()` vorhanden?
3. ✅ `styles.scss` in `project.json` unter `build.options.styles`?
4. ✅ Frontend neu gebaut? (`npx nx build frontend`)

---

### **Problem: Icons werden nicht angezeigt**

**Lösung:**

1. Prüfe ob Material Icons in `index.html` eingebunden sind
2. Verwende `<mat-icon>icon_name</mat-icon>` statt `<i class="material-icons">`
3. Import `MatIconModule` in Component

**Verfügbare Icons:** [Google Material Icons](https://fonts.google.com/icons)

---

### **Problem: Animationen funktionieren nicht**

**Lösung:**

```typescript
// In app.config.ts
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimationsAsync(), // ← Muss vorhanden sein
  ],
};
```

---

## 📚 Weitere Ressourcen

### **Offizielle Dokumentation:**

- [Angular Material Docs](https://material.angular.io/)
- [Angular CDK Docs](https://material.angular.io/cdk/categories)
- [Material Design Guidelines](https://m3.material.io/)

### **Nützliche Tools:**

- [Material Theme Generator](https://materialtheme.arcsine.dev/)
- [Material Color Tool](https://m2.material.io/design/color/the-color-system.html#tools-for-picking-colors)
- [Material Icon Search](https://fonts.google.com/icons)

### **Tutorials:**

- [Angular Material Theming Guide](https://material.angular.io/guide/theming)
- [Custom Themes erstellen](https://material.angular.io/guide/theming-your-components)

---

## 🎉 Zusammenfassung

**Was eingerichtet wurde:**

- ✅ Angular Material v20.2.x installiert
- ✅ Custom Theme (Indigo/Pink/Red) erstellt
- ✅ Roboto Font & Material Icons eingebunden
- ✅ Animations Provider konfiguriert
- ✅ Frontend erfolgreich gebaut

**Nächste Schritte:**

1. Material Komponenten in Components verwenden
2. Login-Formular mit Material Forms erstellen
3. Navigation mit Material Toolbar/Sidenav
4. Projekt-Liste mit Material Cards/Table
5. Tickets mit Material Dialogs verwalten

**Das Frontend ist bereit für die UI-Entwicklung mit Angular Material! 🚀**
