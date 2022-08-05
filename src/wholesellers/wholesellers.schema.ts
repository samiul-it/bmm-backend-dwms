import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type WholesellersDocument = Wholesellers & Document;

class Category {
  categoryName: string;
  categoryId: mongoose.Schema.Types.ObjectId;
  ref: 'Category';
}
@Schema({ timestamps: true })
export class Wholesellers {
  @Prop()
  name: string;

  @Prop()
  catagories: Category[];

  @Prop({ unique: false, required: true })
  phone: string;

  // @Prop({required:false})
  // whatsapp?: string;

  @Prop({ unique: false, required: true })
  
  email?: string;

  @Prop({ required: false })
  password?: string;

  @Prop({
    required: true,
    default: 'wholeseller',
    enum: ['admin', 'wholeseller'],
  })
  role?: string;
}

export const WholesellersSchema = SchemaFactory.createForClass(Wholesellers);
