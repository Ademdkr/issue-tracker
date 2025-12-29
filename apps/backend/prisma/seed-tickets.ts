import { PrismaClient, TicketStatus, TicketPriority } from '@prisma/client';

const prisma = new PrismaClient();

// Ticket-Daten für Employee Portal
const employeePortalTickets = [
  {
    title: 'Urlaubsantrag wird nicht gespeichert',
    description:
      'Beim Einreichen eines Urlaubsantrags über das Formular erscheint die Fehlermeldung "Speichern fehlgeschlagen". Die eingegebenen Daten gehen verloren. Betrifft Firefox 121 und Chrome 120.',
    status: TicketStatus.OPEN,
    priority: TicketPriority.HIGH,
  },
  {
    title: 'Gehaltsabrechnung Download funktioniert nicht',
    description:
      'Der PDF-Download der Gehaltsabrechnungen schlägt fehl. Nach Klick auf "Download" passiert nichts. Die Datei erscheint nicht im Downloads-Ordner. Reproduzierbar für alle Mitarbeiter.',
    status: TicketStatus.IN_PROGRESS,
    priority: TicketPriority.CRITICAL,
  },
  {
    title: 'Profilbild Upload - Größenlimit zu klein',
    description:
      'Das aktuelle Größenlimit für Profilbilder (500 KB) ist zu niedrig. Moderne Smartphone-Kameras erzeugen Bilder >1 MB. Vorschlag: Limit auf 2 MB erhöhen und automatische Komprimierung implementieren.',
    status: TicketStatus.OPEN,
    priority: TicketPriority.MEDIUM,
  },
  {
    title: 'Fehlende Validierung bei Telefonnummer-Eingabe',
    description:
      'Im Profil-Bereich können ungültige Telefonnummern (z.B. Buchstaben) eingegeben werden. Es fehlt eine Client- und Server-seitige Validierung. Erwartetes Format: +49 oder 0 gefolgt von 7-15 Ziffern.',
    status: TicketStatus.RESOLVED,
    priority: TicketPriority.LOW,
  },
  {
    title: 'Dark Mode implementieren',
    description:
      'Anfrage mehrerer Mitarbeiter: Implementierung eines Dark Mode für bessere Lesbarkeit bei Nachtschicht. Sollte systemweite Einstellung respektieren und manuell umschaltbar sein.',
    status: TicketStatus.OPEN,
    priority: TicketPriority.MEDIUM,
  },
  {
    title: 'E-Mail-Benachrichtigungen doppelt',
    description:
      'Mitarbeiter erhalten doppelte E-Mail-Benachrichtigungen für Urlaubsgenehmigungen. Problem tritt seit dem letzten Update auf. Logs zeigen, dass der Job zweimal ausgeführt wird.',
    status: TicketStatus.IN_PROGRESS,
    priority: TicketPriority.HIGH,
  },
  {
    title: 'Passwort-Reset-Link läuft zu schnell ab',
    description:
      'Der Link zum Zurücksetzen des Passworts läuft nach 15 Minuten ab. Viele Mitarbeiter schaffen es nicht rechtzeitig. Vorschlag: Ablaufzeit auf 1 Stunde erhöhen.',
    status: TicketStatus.OPEN,
    priority: TicketPriority.LOW,
  },
  {
    title: 'Suchfunktion findet keine archivierten Mitarbeiter',
    description:
      'Die globale Mitarbeitersuche zeigt keine archivierten/ausgeschiedenen Mitarbeiter an. Für HR-Prozesse ist es aber wichtig, auch historische Daten zu durchsuchen.',
    status: TicketStatus.CLOSED,
    priority: TicketPriority.MEDIUM,
  },
  {
    title: 'Kalenderintegration mit Outlook fehlt',
    description:
      'Anfrage: Integration mit Microsoft Outlook Kalender, damit genehmigte Urlaubstage automatisch im Kalender erscheinen. Reduziert manuelle Eingaben.',
    status: TicketStatus.OPEN,
    priority: TicketPriority.MEDIUM,
  },
  {
    title: 'Performance-Problem beim Laden der Überstundenliste',
    description:
      'Die Überstundenliste lädt sehr langsam (>10 Sekunden) für Mitarbeiter mit vielen Einträgen. Pagination oder Lazy Loading implementieren.',
    status: TicketStatus.IN_PROGRESS,
    priority: TicketPriority.HIGH,
  },
];

// Ticket-Daten für E-Commerce Platform
const ecommercePlatformTickets = [
  {
    title: 'Warenkorb wird nach Login gelöscht',
    description:
      'Wenn ein Gast-Nutzer Artikel in den Warenkorb legt und sich dann einloggt, wird der Warenkorb geleert. Die Artikel sollten nach Login erhalten bleiben und mit dem Benutzerkonto synchronisiert werden.',
    status: TicketStatus.OPEN,
    priority: TicketPriority.CRITICAL,
  },
  {
    title: 'PayPal-Zahlung schlägt bei Beträgen über 500€ fehl',
    description:
      'PayPal-Transaktionen über 500€ werden mit Fehlercode "AMOUNT_LIMIT_EXCEEDED" abgelehnt. Ursache: Merchant-Account hat nur Standard-Limit. Lösung: Business-Account-Upgrade beantragen oder Split-Payment implementieren.',
    status: TicketStatus.IN_PROGRESS,
    priority: TicketPriority.CRITICAL,
  },
  {
    title: 'Produktbilder laden sehr langsam',
    description:
      'Produktbilder in der Kategorie-Übersicht benötigen 3-5 Sekunden zum Laden. Originalbilder werden mit 4 MB statt komprimiert ausgeliefert. Implementierung von Lazy Loading und WebP-Format mit automatischer Komprimierung erforderlich.',
    status: TicketStatus.OPEN,
    priority: TicketPriority.HIGH,
  },
  {
    title: 'Suchfunktion findet keine Umlaute',
    description:
      'Die Produktsuche findet keine Ergebnisse bei Eingabe von Umlauten (ä, ö, ü). Beispiel: Suche nach "Kühlschrank" liefert 0 Treffer, "Kuehlschrank" funktioniert. Elasticsearch-Analyzer muss um German Normalization erweitert werden.',
    status: TicketStatus.RESOLVED,
    priority: TicketPriority.MEDIUM,
  },
  {
    title: 'Rabattcode kann mehrfach verwendet werden',
    description:
      'Einmalige Rabattcodes (WELCOME20) können durch Öffnen mehrerer Browser-Tabs mehrfach auf denselben Account angewendet werden. Sicherheitslücke: Validierung nur Client-seitig. Server-seitige Prüfung + Redemption-Lock implementieren.',
    status: TicketStatus.OPEN,
    priority: TicketPriority.CRITICAL,
  },
  {
    title: 'Mobile Checkout-Formular abgeschnitten',
    description:
      'Auf iPhone SE (375px Breite) wird der "Kaufen"-Button vom unteren Bildschirmrand abgeschnitten. Footer überlappt das Formular. Responsive Layout für kleine Viewports anpassen.',
    status: TicketStatus.IN_PROGRESS,
    priority: TicketPriority.HIGH,
  },
  {
    title: 'Produktbewertungen können nicht bearbeitet werden',
    description:
      'Kunden können abgegebene Produktbewertungen nicht nachträglich bearbeiten. "Bearbeiten"-Button fehlt. Feature-Request: Edit-Funktion innerhalb von 48h nach Erstellen.',
    status: TicketStatus.OPEN,
    priority: TicketPriority.LOW,
  },
  {
    title: 'Versandkosten werden falsch berechnet',
    description:
      'Bei Bestellungen mit mehreren Artikeln aus verschiedenen Lagern werden Versandkosten nur einmal statt pro Lager berechnet. Führt zu finanziellen Verlusten.',
    status: TicketStatus.CLOSED,
    priority: TicketPriority.HIGH,
  },
  {
    title: 'Newsletter-Abmeldung funktioniert nicht',
    description:
      'Der "Abmelden"-Link im Newsletter führt zu 404-Fehler. Kunden können sich nicht vom Newsletter abmelden. DSGVO-Verstoß!',
    status: TicketStatus.IN_PROGRESS,
    priority: TicketPriority.CRITICAL,
  },
  {
    title: 'Wunschliste wird nicht synchronisiert',
    description:
      'Artikel in der Wunschliste werden nicht geräteübergreifend synchronisiert. Desktop-Wunschliste unterscheidet sich von Mobile-App. Cloud-Sync implementieren.',
    status: TicketStatus.OPEN,
    priority: TicketPriority.MEDIUM,
  },
];

// Ticket-Daten für ERP-System
const erpSystemTickets = [
  {
    title: 'Inventur-Export generiert falsche Bestandszahlen',
    description:
      'Der Excel-Export der Inventur zeigt abweichende Bestände im Vergleich zur Datenbank. Artikel mit Chargen-Verwaltung werden mehrfach gezählt. Betrifft Warehouse-Modul seit Update v3.2.1. Kritisch für Monatsabschluss.',
    status: TicketStatus.OPEN,
    priority: TicketPriority.CRITICAL,
  },
  {
    title: 'Lieferantenbestellung kann nicht storniert werden',
    description:
      'Bestellungen mit Status "Teilgeliefert" lassen sich nicht stornieren. Button "Stornieren" ist ausgegraut. Workaround: Manuelle Statusänderung in Datenbank. Permanente Lösung: Teilstorno-Funktion implementieren.',
    status: TicketStatus.IN_PROGRESS,
    priority: TicketPriority.HIGH,
  },
  {
    title: 'Doppelte Rechnungsnummern bei gleichzeitiger Erstellung',
    description:
      'Wenn zwei Benutzer gleichzeitig Rechnungen erstellen, wird dieselbe Rechnungsnummer vergeben. Race Condition in der Nummernkreisvergabe. Lösung: Datenbanksperre oder atomare Inkrementierung implementieren.',
    status: TicketStatus.OPEN,
    priority: TicketPriority.CRITICAL,
  },
  {
    title: 'Performance-Problem bei Buchungsjournal-Abfrage',
    description:
      'Abfrage des Buchungsjournals für Zeitraum >3 Monate führt zu Timeout (>30 Sekunden). Datenbank enthält 2,5 Mio. Buchungssätze. Index auf "buchungsdatum" fehlt. Query-Optimierung und Pagination erforderlich.',
    status: TicketStatus.RESOLVED,
    priority: TicketPriority.HIGH,
  },
  {
    title: 'Automatische USt-Berechnung fehlerhaft bei Drittland',
    description:
      'Bei Rechnungen an Schweizer Kunden wird fälschlicherweise 19% MwSt. berechnet. Reverse-Charge-Verfahren wird nicht erkannt. Länderkennzeichen-Logik im Tax-Calculator muss erweitert werden (CH, GB, NO, etc.).',
    status: TicketStatus.OPEN,
    priority: TicketPriority.CRITICAL,
  },
  {
    title: 'Monatsabschluss bricht bei fehlenden Kostenstellen ab',
    description:
      'Der automatische Monatsabschluss schlägt fehl, wenn Buchungen ohne Kostenstelle existieren. Fehlermeldung unklar. Erwartetes Verhalten: Warnung ausgeben, aber Abschluss fortsetzen mit Standard-Kostenstelle.',
    status: TicketStatus.IN_PROGRESS,
    priority: TicketPriority.HIGH,
  },
  {
    title: 'Artikel-Import aus Excel schlägt bei Umlauten fehl',
    description:
      'CSV-Import von Artikeldaten schlägt fehl, wenn Produktnamen Umlaute enthalten. Encoding-Problem: Datei wird als ASCII statt UTF-8 gelesen. Import-Funktion muss UTF-8-BOM erkennen.',
    status: TicketStatus.OPEN,
    priority: TicketPriority.MEDIUM,
  },
  {
    title: 'Lagerbestand geht bei API-Timeout verloren',
    description:
      'Wenn der Warenwirtschafts-API-Call einen Timeout hat, wird der Lagerbestand nicht aktualisiert, aber die Bestellung als "abgeschlossen" markiert. Führt zu Bestandsdifferenzen. Transaction-Rollback implementieren.',
    status: TicketStatus.CLOSED,
    priority: TicketPriority.HIGH,
  },
  {
    title: 'Dashboard-KPIs zeigen veraltete Daten',
    description:
      'Die KPI-Widgets im Dashboard (Umsatz, Gewinn, etc.) aktualisieren sich nicht automatisch. Nur manueller Refresh hilft. Real-time Updates oder zumindest automatischer Reload alle 5 Minuten gewünscht.',
    status: TicketStatus.OPEN,
    priority: TicketPriority.LOW,
  },
  {
    title: 'Druckvorschau für Lieferscheine zeigt falsches Layout',
    description:
      'Die Druckvorschau für Lieferscheine zeigt ein anderes Layout als der tatsächliche Ausdruck. Logo wird nicht angezeigt, Seitenumbrüche falsch. CSS Print-Styles überarbeiten.',
    status: TicketStatus.IN_PROGRESS,
    priority: TicketPriority.MEDIUM,
  },
];

async function main() {
  console.log('🔍 Analysiere Datenbank...');

  // Hole alle Projekte
  const projects = await prisma.project.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });

  if (projects.length === 0) {
    console.log('❌ Keine Projekte in der Datenbank gefunden!');
    return;
  }

  console.log(`✅ ${projects.length} Projekte gefunden:`);
  projects.forEach((p) => console.log(`   - ${p.name} (${p.slug})`));

  // Hole alle Benutzer
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      surname: true,
      role: true,
    },
  });

  if (users.length === 0) {
    console.log('❌ Keine Benutzer in der Datenbank gefunden!');
    return;
  }

  console.log(`\n✅ ${users.length} Benutzer gefunden`);

  // Erstelle Tickets für jedes Projekt
  for (const project of projects) {
    console.log(`\n📝 Erstelle Tickets für "${project.name}"...`);

    let ticketsData: any[] = [];

    // Wähle passende Tickets basierend auf Projektnamen
    if (project.name.toLowerCase().includes('employee')) {
      ticketsData = employeePortalTickets;
    } else if (project.name.toLowerCase().includes('commerce')) {
      ticketsData = ecommercePlatformTickets;
    } else if (project.name.toLowerCase().includes('erp')) {
      ticketsData = erpSystemTickets;
    } else {
      // Fallback: Verwende Employee Portal Tickets
      ticketsData = employeePortalTickets;
    }

    // Erstelle Tickets
    for (const ticketData of ticketsData) {
      // Wähle zufälligen Reporter und Assignee
      const reporter = users[Math.floor(Math.random() * users.length)];
      const assignee =
        Math.random() > 0.3
          ? users[Math.floor(Math.random() * users.length)]
          : null;

      try {
        await prisma.ticket.create({
          data: {
            projectId: project.id,
            reporterId: reporter.id,
            assigneeId: assignee?.id,
            title: ticketData.title,
            description: ticketData.description,
            status: ticketData.status,
            priority: ticketData.priority,
          },
        });
        console.log(`   ✓ ${ticketData.title}`);
      } catch (error) {
        console.error(
          `   ✗ Fehler bei "${ticketData.title}":`,
          (error as Error).message
        );
      }
    }
  }

  console.log('\n✅ Tickets erfolgreich erstellt!');
}

main()
  .catch((e) => {
    console.error('❌ Fehler:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
