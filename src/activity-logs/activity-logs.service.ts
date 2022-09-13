import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ActivityLogs, ActivityLogsDocument } from './activity-logs.schema';

@Injectable()
export class ActivityLogsService {
  constructor(
    @InjectModel(ActivityLogs.name)
    private activityLogsModel: Model<ActivityLogsDocument>,
  ) {}

  async getAllLogs() {
    return this.activityLogsModel
      .find()
      .sort({ createdAt: -1 })
      .catch((err) => {
        throw new InternalServerErrorException(err);
      });
  }

  async createActivityLog(userId: string, activity: string) {
    return this.activityLogsModel.create({
      userId: userId,
      activity: activity,
    });
  }
}
