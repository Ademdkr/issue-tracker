/**
 * @fileoverview Policy-basierte Zugriffskontrolle für NestJS.
 *
 * Implementiert ein flexibles Berechtigungssystem basierend auf Policy-Klassen.
 * Ermöglicht Separation of Concerns, Wiederverwendbarkeit und einfache Testbarkeit.
 */

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ModuleRef } from '@nestjs/core';
import { IPolicyHandler } from '../policies/policy-handler.interface';

/**
 * Metadata-Schlüssel für Policy-Handler.
 *
 * Wird vom @CheckPolicies Decorator verwendet, um Policy-Klassen
 * an Controller-Methoden anzuhängen.
 */
export const CHECK_POLICIES_KEY = 'check_policies';

/**
 * Type für Policy-Handler-Konstruktoren.
 *
 * Repräsentiert eine Klasse (nicht eine Instanz), die IPolicyHandler implementiert.
 * Der DI-Container instantiiert die Klasse automatisch.
 */
type PolicyHandlerClass = new (...args: unknown[]) => IPolicyHandler;

/**
 * Custom Decorator zum Anhängen von Policy-Klassen an Controller-Methoden.
 *
 * @param handlers - Eine oder mehrere Policy-Handler-Klassen
 * @returns Metadata Decorator Function
 *
 * @example
 * ```typescript
 * @CheckPolicies(UpdateTicketPolicyHandler)
 * async update() { }
 *
 * // Mehrere Policies (alle müssen erfüllt sein)
 * @CheckPolicies(UpdateTicketPolicyHandler, ProjectAccessPolicyHandler)
 * async update() { }
 * ```
 */
export const CheckPolicies = (...handlers: PolicyHandlerClass[]) =>
  Reflect.metadata(CHECK_POLICIES_KEY, handlers);

/**
 * NestJS Guard zur Durchsetzung von Policy-basierten Berechtigungen.
 *
 * Wird nach CurrentUserGuard ausgeführt und validiert, ob der angemeldete User
 * die erforderlichen Policies erfüllt.
 *
 * @remarks
 * Guard Lifecycle: Middleware → Guards → Interceptors → Controller
 */
@Injectable()
export class PoliciesGuard implements CanActivate {
  /**
   * @param reflector - Zugriff auf Decorator-Metadaten (@CheckPolicies)
   * @param moduleRef - Zugriff auf DI-Container für dynamische Instantiierung
   */
  constructor(private reflector: Reflector, private moduleRef: ModuleRef) {}

  /**
   * Entscheidet ob der Request durchgelassen wird.
   *
   * @param context - Execution Context mit Request-Informationen
   * @returns `true` wenn alle Policies erfüllt sind, sonst ForbiddenException
   *
   * @throws {ForbiddenException} Wenn User nicht authentifiziert oder Policy fehlschlägt
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Policy Handler Classes aus Metadaten holen
    const policyHandlers = this.reflector.get<PolicyHandlerClass[]>(
      CHECK_POLICIES_KEY,
      context.getHandler()
    );

    // Keine Policies definiert = erlaubt
    if (!policyHandlers || policyHandlers.length === 0) {
      return true;
    }

    // Request-Daten holen
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // User-Authentifizierung prüfen
    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Alle Policy Handler sequentiell ausführen
    for (const HandlerClass of policyHandlers) {
      // Policy Handler aus DI Container holen
      const handler = this.moduleRef.get(HandlerClass, { strict: false });

      if (!handler) {
        throw new Error(
          `Policy handler ${HandlerClass.name} not found in DI container`
        );
      }

      // Policy ausführen
      const allowed = await handler.handle(user);

      // Zugriff verweigern wenn Policy fehlschlägt
      if (!allowed) {
        throw new ForbiddenException(
          `Access denied: ${HandlerClass.name} policy failed`
        );
      }
    }

    // Alle Policies erfüllt
    return true;
  }
}
