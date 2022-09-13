import { Controller, Get, Post, UseGuards } from '@nestjs/common';
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
}
