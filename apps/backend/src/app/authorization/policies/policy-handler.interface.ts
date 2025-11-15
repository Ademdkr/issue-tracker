import { User } from '@issue-tracker/shared-types';

/**
 * Interface für Policy Handler
 * Jede Policy muss diese Methode implementieren
 */
export interface IPolicyHandler<T = unknown> {
  /**
   * Prüft ob User die Aktion auf Resource ausführen darf
   * @param user - Der angemeldete User
   * @param resource - Optional: Die Resource (z.B. Ticket, Project)
   * @returns true wenn erlaubt, false wenn nicht
   */
  handle(user: User, resource?: T): Promise<boolean> | boolean;
}

/**
 * Abstract Base Class für einfachere Implementierung
 */
export abstract class PolicyHandler<T = unknown> implements IPolicyHandler<T> {
  abstract handle(user: User, resource?: T): Promise<boolean> | boolean;
}
