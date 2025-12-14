import { User } from '@issue-tracker/shared-types';

/**
 * Interface für Policy Handler.
 *
 * Definiert den Vertrag für alle Berechtigungsprüfungen (Policies).
 * Jede Policy-Klasse muss die `handle()` Methode implementieren.
 *
 * @template T - Der Typ der zu prüfenden Resource (default: unknown)
 *
 * @example
 * ```typescript
 * class UpdateTicketPolicyHandler implements IPolicyHandler<Ticket> {
 *   handle(user: User, resource?: Ticket): boolean {
 *     return user.role === 'MANAGER' || user.id === resource?.assigneeId;
 *   }
 * }
 * ```
 */
export interface IPolicyHandler<T = unknown> {
  /**
   * Prüft ob ein User berechtigt ist, eine bestimmte Aktion auszuführen.
   *
   * @param user - Der angemeldete User
   * @param resource - Optional: Die zu prüfende Resource (future-proof)
   * @returns `true` wenn erlaubt, `false` wenn verboten
   */
  handle(user: User, resource?: T): Promise<boolean> | boolean;
}

/**
 * Abstract Base Class für Policy Handler.
 *
 * Bietet eine Basis-Implementierung für IPolicyHandler.
 * Ermöglicht zukünftige Erweiterungen mit geteilter Logik (z.B. Logging, Caching).
 *
 * @template T - Der Typ der zu prüfenden Resource (default: unknown)
 *
 * @remarks
 * Policies können entweder das Interface implementieren oder von dieser Klasse erben.
 * Beide Ansätze funktionieren mit dem PoliciesGuard.
 *
 * @example
 * ```typescript
 * class DeleteTicketPolicyHandler extends PolicyHandler<Ticket> {
 *   handle(user: User, resource?: Ticket): boolean {
 *     return user.role === 'MANAGER';
 *   }
 * }
 * ```
 */
export abstract class PolicyHandler<T = unknown> implements IPolicyHandler<T> {
  /**
   * Prüft ob ein User berechtigt ist, eine bestimmte Aktion auszuführen.
   *
   * @param user - Der angemeldete User
   * @param resource - Optional: Die zu prüfende Resource
   * @returns `true` wenn erlaubt, `false` wenn verboten
   */
  abstract handle(user: User, resource?: T): Promise<boolean> | boolean;
}
