import { Injectable } from '@nestjs/common';

/**
 * SlugGeneratorService - Service für intelligente Slug-Generierung
 *
 * Generiert kurze, prägnante Slugs aus Projektnamen basierend auf:
 * - Bekannten Begriffen (Portal, CRM, Shop, etc.)
 * - Akronymen aus mehreren Wörtern
 * - Abkürzungen einzelner Wörter
 */
@Injectable()
export class SlugGeneratorService {
  /**
   * Liste bekannter Begriffe, die als direkte Abkürzung verwendet werden
   */
  private readonly knownTerms = [
    'portal',
    'crm',
    'shop',
    'app',
    'system',
    'tool',
    'platform',
    'dashboard',
    'api',
    'web',
    'mobile',
    'admin',
    'manager',
    'tracker',
    'monitor',
    'analytics',
    'cms',
    'erp',
    'hr',
    'pos',
    'blog',
    'forum',
    'chat',
    'mail',
    'calendar',
    'todo',
    'task',
    'project',
  ];

  /**
   * Generiert einen intelligenten Slug aus dem Projektnamen
   *
   * Algorithmus:
   * 1. Bekannte Begriffe (Portal, CRM, Shop, etc.) → Werden als Abkürzung verwendet
   * 2. Einzelnes Wort → Erste 5 Zeichen in Großbuchstaben
   * 3. Mehrere Wörter → Akronym aus ersten Buchstaben
   *
   * Beispiele:
   * - "Logistik-Portal" → "PORTAL"
   * - "Kunden-CRM" → "CRM"
   * - "Web-Shop" → "SHOP"
   * - "Issue Tracker" → "IT"
   * - "Dashboard" → "DASHB"
   *
   * @param name - Der Projektname
   * @returns Generierter Slug in Großbuchstaben
   */
  generateSlug(name: string): string {
    // Projektname normalisieren und in Wörter aufteilen
    const words = this.normalizeAndSplit(name);

    // Fallback wenn keine gültigen Wörter gefunden wurden
    if (words.length === 0) {
      return 'PROJECT';
    }

    // Letztes Wort extrahieren für Begriff-Prüfung
    const lastWord = words[words.length - 1];

    // Prüfung: Ist das letzte Wort ein bekannter Begriff?
    // Beispiel: "Logistik-Portal" → "portal" ist bekannt → "PORTAL"
    if (this.knownTerms.includes(lastWord)) {
      return lastWord.toUpperCase();
    }

    // Spezialfall: Nur ein Wort vorhanden
    // Beispiel: "Dashboard" → "DASHB" (erste 5 Zeichen)
    if (words.length === 1) {
      return words[0].substring(0, 5).toUpperCase();
    }

    // Standardfall: Akronym aus ersten Buchstaben aller Wörter
    // Beispiel: "Issue Tracker" → "IT", "Customer Management" → "CM"
    return this.createAcronym(words);
  }

  /**
   * Normalisiert einen String und teilt ihn in Wörter auf
   *
   * @param name - Der zu normalisierende String
   * @returns Array von Wörtern in Kleinbuchstaben
   */
  private normalizeAndSplit(name: string): string[] {
    return name
      .toLowerCase() // Kleinschreibung für einheitliche Verarbeitung
      .trim() // Leerzeichen am Anfang/Ende entfernen
      .replace(/[^a-z0-9\s-]/g, '') // Sonderzeichen entfernen (nur Buchstaben, Zahlen, Leerzeichen, Bindestriche)
      .split(/[-\s]+/) // Nach Leerzeichen und Bindestrichen in Wörter aufteilen
      .filter((word) => word.length > 0); // Leere Strings entfernen
  }

  /**
   * Erstellt ein Akronym aus den ersten Buchstaben der Wörter
   *
   * @param words - Array von Wörtern
   * @returns Akronym in Großbuchstaben
   */
  private createAcronym(words: string[]): string {
    return words
      .map((word) => word.charAt(0)) // Ersten Buchstaben jedes Wortes
      .join('') // Zusammenfügen
      .toUpperCase(); // In Großbuchstaben
  }
}
