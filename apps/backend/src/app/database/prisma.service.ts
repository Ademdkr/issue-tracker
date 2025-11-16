import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  constructor() {
    super({
      datasources: {
        db: {
          url: 'postgresql://postgres:1234@localhost:5435/issue_tracker_db',
        },
      },
    });
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
