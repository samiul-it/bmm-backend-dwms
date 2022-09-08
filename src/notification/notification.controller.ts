import { Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { NotificationService } from './notification.service';

@UseGuards(AuthGuard())
@Controller('notification')
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  @Get()
  async getNotificationsByUserId(@CurrentUser() user: any) {
    return await this.notificationService.getNotificationsByUserId(user?._id);
  }

  @Put('/updateIsSeen')
  async updateIsSeen(@CurrentUser() user: any) {
    return await this.notificationService.updateIsSeen(user);
  }
}
