import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type SubCategoryDocument = SubCategory & Document;

@Schema({ timestamps: true })
export class SubCategory {
  @Prop()
  name: string;

  @Prop({ unique: true })
  slug: string;

  @Prop({ required: false })
  imageLink: string;

  @Prop({type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true })
  cateogry: string;

  @Prop({ required: false })
  description?: string;

  @Prop({ required: true })
  discount_wholesale:number

  @Prop({ required: true })
  discount_retail:number


}

export const SubCategorySchema = SchemaFactory.createForClass(SubCategory);