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

  async getPagination(page: number, limit: number, searchQuery: string) {
    const logs = await this.activityLogsModel
      .find({ activity: { $regex: searchQuery || '', $options: 'i' } })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    let totalDocuments = await this.activityLogsModel
      .find({ activity: { $regex: searchQuery || '', $options: 'i' } })
      .count();

    const totalPages = Math.ceil(totalDocuments / limit);

    const result = {
      curruntPage: page,
      limit: limit,
      totalPages,
      totalDocuments,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
      itemList: logs,
    };

    return result;
  }
}
