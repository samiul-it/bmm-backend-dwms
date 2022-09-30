import { Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { ActivityLogsService } from './activity-logs.service';

@UseGuards(AuthGuard())
@Controller('activity-logs')
export class ActivityLogsController {
  constructor(private activityLogsService: ActivityLogsService) {}

  @Get()
  async getAllLogs() {
    return await this.activityLogsService.getAllLogs();
  }

  @Get('/getPagination')
  async getPagination(@Query() query: any) {
    return await this.activityLogsService.getPagination(
      Number(query?.page) || 1,
      Number(query?.limit) || 15,
      String(query?.search) || '',
    );
  }
}
