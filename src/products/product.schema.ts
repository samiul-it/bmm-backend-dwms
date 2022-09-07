import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type ProductDocument = Product & Document;

export class Attributes {
  name: string;
  value: string;
}

@Schema({ timestamps: true })
export class Product {
  @Prop()
  product_name: string;

  @Prop({ required: false })
  product_desc?: string;

  @Prop({ unique: true })
  slug: string;

  @Prop({ required: false })
  imageLink: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubCategory',
    required: false,
  })
  subcategory: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  })
  category: string;

  @Prop()
  attributes: Attributes[];

  @Prop()
  metadata: string[];

  @Prop()
  price_wholesale: number;

  @Prop()
  price_retail: number;

  @Prop()
  mrp: number;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
