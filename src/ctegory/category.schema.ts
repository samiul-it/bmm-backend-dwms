import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CategoryDocument = Category & Document;

@Schema({ timestamps: true })
export class Category {
  @Prop({ required: true })
  name: string;

  @Prop({ unique: true })
  slug: string;

  @Prop()
  imageLink: string;


  @Prop({ required: false })
  description?: string;

  @Prop({ required: false })
  metaData:string[]
}

export const CategorySchema = SchemaFactory.createForClass(Category);
