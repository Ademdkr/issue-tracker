import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  constructor() {
    // Use DATABASE_URL from environment - do NOT hardcode!
    super();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
