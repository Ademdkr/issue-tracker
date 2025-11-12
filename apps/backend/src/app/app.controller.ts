import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prismaService: PrismaService
  ) {}

  @Get()
  getData() {
    return this.appService.getData();
  }

  @Get('users')
  async getUsers() {
    try {
      const users = await this.prismaService.user.findMany({
        select: {
          id: true,
          name: true,
          surname: true,
          email: true,
          role: true,
          createdAt: true,
        },
      });

      return {
        status: 'success',
        users: users,
        count: users.length,
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }
}
