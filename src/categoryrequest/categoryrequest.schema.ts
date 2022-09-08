import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type CategoryRequestDocument = CategoryReq & Document;

class Category {
  categoryName: string;
  categoryId: mongoose.Schema.Types.ObjectId;
}
@Schema({ timestamps: true })
export class CategoryReq {
  @Prop()
  wholesellerId: string;

  @Prop({default: 'active'})
  status: string;

  @Prop()
  categories: Category[];
}

export const CategoryReqSchema = SchemaFactory.createForClass(CategoryReq);
