import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { IsMongoId } from 'class-validator';
import mongoose, { Model, Mongoose } from 'mongoose';
import { Notification, NotificationDocument } from './notification.schema';

export class MessageDTO {
  message: string;
  cretedAt: Date;
  isSeen: boolean;
}

export class NotificationDTO {
  @IsMongoId()
  _id: string;

  userId: string;
  socketId: string;
  messages: MessageDTO[];
}

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name)
    private notificationModal: Model<NotificationDocument>,
  ) {}

  async createNotification(data: any) {
    console.log('Called createNotification', data);

    const exists = await this.notificationModal.findOne({
      userId: data.userId,
    });

    // console.log('Found existing Notification', exists);

    if (exists) {
      const _data = {
        socketId: data.socketId,
      };
      return await this.notificationModal
        .findOneAndUpdate({ userId: data.userId }, _data)
        .catch((err) => {
          throw new InternalServerErrorException(err);
        });
    } else {
      const _data = {
        userId: data.userId,
        socketId: data.socketId,
      };

      return await this.notificationModal.create(_data).catch((err) => {
        throw new InternalServerErrorException(err);
      });
    }
  }

  async getNotificationsByUserId(id: string) {
    return await this.notificationModal.findOne({ userId: id }).catch((err) => {
      throw new InternalServerErrorException(err);
    });
  }

  async pushNotification(data: any) {
    const exists: any = await this.notificationModal.findOne({
      userId: data.userId,
    });

    if (exists) {
      const oldMessage = exists?.messages ? exists?.messages : [];
      const _data = {
        messages: [
          ...oldMessage,
          { message: data.message, cretedAt: new Date(), isSeen: false },
        ],
      };
      return await this.notificationModal
        .findOneAndUpdate({ userId: data.userId }, _data)
        .catch((err) => {
          throw new InternalServerErrorException(err);
        });
    } else {
      const _data = {
        userId: data.userId,
        messages: [
          { message: data.message, cretedAt: new Date(), isSeen: false },
        ],
      };

      return await this.notificationModal.create(_data).catch((err) => {
        throw new InternalServerErrorException(err);
      });
    }
  }

  async updateIsSeen(user: any) {
    return await this.notificationModal
      .updateMany({ isSeen: false }, { isSeen: true })
      .catch((err) => {
        throw new InternalServerErrorException(err);
      });
  }
}
