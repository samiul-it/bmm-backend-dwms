import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { NotificationGateway } from 'src/notification/notification.gateway';
import { WholesellersModule } from 'src/wholesellers/wholesellers.module';
import { NotificationController } from './notification.controller';
import { Notification, NotificationSchema } from './notification.schema';
import { NotificationService } from './notification.service';

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    MongooseModule.forFeature([
      {
        name: Notification.name,
        schema: NotificationSchema,
      },
    ]),
  ],
  providers: [NotificationService, NotificationGateway],
  controllers: [NotificationController],
  exports: [NotificationService, NotificationGateway],
})
export class NotificationModule {}
