import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type NotificationDocument = Notification & Document;

class Message {
  @Prop({ required: true })
  message: string;

  @Prop({ default: new Date().toISOString() })
  cretedAt: Date;

  @Prop({ default: false })
  isSeen: boolean;
}

@Schema({ timestamps: true })
export class Notification {
  @Prop({ required: true, unique: true })
  userId: string;

  @Prop({ required: true, unique: true })
  socketId: string;

  @Prop({ required: true })
  messages: Message[];
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
