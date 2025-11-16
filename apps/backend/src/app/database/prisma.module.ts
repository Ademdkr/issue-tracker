import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * Global verfügbares PrismaModule
 * Stellt PrismaService in allen Modulen bereit
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
