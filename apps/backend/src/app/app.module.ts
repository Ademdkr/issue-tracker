import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { IssuesService } from './issues.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, PrismaService, IssuesService],
})
export class AppModule {}
