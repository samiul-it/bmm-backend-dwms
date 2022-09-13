import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { ActivityLogsController } from './activity-logs.controller';
import { ActivityLogs, ActivityLogsSchema } from './activity-logs.schema';
import { ActivityLogsService } from './activity-logs.service';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    // NotificationModule,
    // UserModule,
    MongooseModule.forFeature([
      {
        name: ActivityLogs.name,
        schema: ActivityLogsSchema,
      },
    ]),
  ],

  controllers: [ActivityLogsController],
  providers: [ActivityLogsService],
  exports: [ActivityLogsService],
})
export class ActivityLogsModule {}
