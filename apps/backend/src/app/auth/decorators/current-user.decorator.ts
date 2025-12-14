import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '@issue-tracker/shared-types';

/**
 * Decorator um aktuellen User aus Request zu extrahieren
 *
 * @example
 * async update(@CurrentUser() user: User, ...) { ... }
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  }
);
