import { Controller, Get, Param } from '@nestjs/common';
import { NotificationService } from './notification.service';

@Controller('notification')
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  @Get('/:id')
  async getNotificationsByUserId(@Param('id') id: string) {
    return await this.notificationService.getNotificationsByUserId(id);
  }
}
