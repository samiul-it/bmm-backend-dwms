import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { ActivityLogsModule } from 'src/activity-logs/activity-logs.module';
import { NotificationModule } from 'src/notification/notification.module';
import { UserModule } from 'src/user/user.module';
import {
  Wholesellers,
  WholesellersSchema,
} from 'src/wholesellers/wholesellers.schema';
import { OrdersController } from './orders.controller';
import { Orders, OrdersSchema } from './orders.schema';
import { OrdersService } from './orders.service';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    NotificationModule,
    UserModule,
    ActivityLogsModule,
    MongooseModule.forFeature([
      {
        name: Wholesellers.name,
        schema: WholesellersSchema,
      },
      {
        name: Orders.name,
        schema: OrdersSchema,
      },
    ]),
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
