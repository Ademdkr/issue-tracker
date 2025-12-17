import { Controller, Get } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { CurrentUser } from '../auth';
import { UserRole } from '@issue-tracker/shared-types';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  async getDashboardStats(@CurrentUser() user: { id: string; role: UserRole }) {
    return this.dashboardService.getDashboardStats(user.id, user.role);
  }
}
