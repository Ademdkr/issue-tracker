import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { PrismaService } from '../../prisma.service';

/**
 * Interceptor der User aus x-user-id Header extrahiert
 * und als request.user verfügbar macht
 *
 * TEMPORÄR: Bis JWT Authentication implementiert ist
 */
@Injectable()
export class CurrentUserInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const userId = request.headers['x-user-id'] as string;

    if (!userId) {
      throw new BadRequestException('x-user-id header is required');
    }

    // User aus DB laden
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    // User am Request anhängen
    request.user = user;

    return next.handle();
  }
}
