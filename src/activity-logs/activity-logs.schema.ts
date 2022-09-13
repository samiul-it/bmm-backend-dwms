import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type ActivityLogsDocument = ActivityLogs & Document;

@Schema({ timestamps: true })
export class ActivityLogs {
  @Prop({ required: true })
  activity: string;

  @Prop({ required: true })
  userId: string;
}

export const ActivityLogsSchema = SchemaFactory.createForClass(ActivityLogs);
