import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { NotificationModule } from 'src/notification/notification.module';
import { ActivityLogsModule } from 'src/activity-logs/activity-logs.module';
import { Wholesellers, WholesellersSchema } from './wholesellers.schema';
import { WholesellersController } from './wholesellers.controller';
import { WholesellersService } from './wholesellers.service';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    NotificationModule,
    ActivityLogsModule,
    MongooseModule.forFeature([
      {
        name: Wholesellers.name,
        schema: WholesellersSchema,
      },
    ]),
  ],
  controllers: [WholesellersController],
  providers: [WholesellersService],
  exports: [WholesellersService],
})
export class WholesellersModule {}
