import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ModuleRef } from '@nestjs/core';
import { IPolicyHandler } from '../../authorization/policies/policy-handler.interface';

export const CHECK_POLICIES_KEY = 'check_policies';

type PolicyHandlerClass = new (...args: unknown[]) => IPolicyHandler;

/**
 * Decorator um Policies am Controller/Endpoint zu definieren
 *
 * @example
 * @CheckPolicies(UpdateTicketPolicyHandler)
 * async update(...) { ... }
 */
export const CheckPolicies = (...handlers: PolicyHandlerClass[]) =>
  Reflect.metadata(CHECK_POLICIES_KEY, handlers);

/**
 * Guard der Policy Handlers ausführt
 * Prüft ob User berechtigt ist basierend auf definierten Policies
 */
@Injectable()
export class PoliciesGuard implements CanActivate {
  constructor(private reflector: Reflector, private moduleRef: ModuleRef) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. Policy Handler Classes aus Metadata holen
    const policyHandlers = this.reflector.get<PolicyHandlerClass[]>(
      CHECK_POLICIES_KEY,
      context.getHandler()
    );

    if (!policyHandlers || policyHandlers.length === 0) {
      return true; // Keine Policies definiert = erlaubt
    }

    // 2. Request-Daten holen
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // 3. Resource aus Request extrahieren (falls vorhanden)
    // Wird von Service/Interceptor gesetzt
    const resource = request.resource;

    // 4. Alle Policy Handler instantiieren und ausführen
    for (const HandlerClass of policyHandlers) {
      // Policy Handler aus DI Container holen
      const handler = this.moduleRef.get(HandlerClass, { strict: false });

      if (!handler) {
        throw new Error(
          `Policy handler ${HandlerClass.name} not found in DI container`
        );
      }

      // Policy ausführen
      const allowed = await handler.handle(user, resource);

      if (!allowed) {
        throw new ForbiddenException(
          `Access denied: ${HandlerClass.name} policy failed`
        );
      }
    }

    return true; // Alle Policies erfolgreich
  }
}
