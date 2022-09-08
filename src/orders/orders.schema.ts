import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type OrdersDocument = Orders & Document;

export class Buyers {
  type: mongoose.Schema.Types.ObjectId;
  ref: 'Users';
}

export class CreatedBy {
  type: mongoose.Schema.Types.ObjectId;
  ref: 'Users';
}
export class Product {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Products',
    required: true,
  })
  _id: string;

  @Prop({ required: true })
  product_name: string;

  @Prop({ required: true })
  price_wholesale: number;

  @Prop({ required: true })
  price_retail: number;

  @Prop({ required: true })
  mrp: number;
}

export class Products {
  @Prop({ required: true })
  product: Product;
  @Prop({ required: true })
  quantity: number;
}

export class Status {
  @Prop({ default: 'placed', required: true })
  status: string;

  @Prop({ default: new Date(), required: true })
  createdAt: Date;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId })
  user: string;

  @Prop({ required: true })
  updatedBy: string;
}

@Schema({ timestamps: true })
export class Orders {
  @Prop({ required: true })
  products: Products[];

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wholseller',
  })
  buyersId: string;

  @Prop({ required: true })
  buyersName: string;

  @Prop({ required: true, ref: 'Wholseller' })
  buyersEmail: string;

  @Prop({ required: true, ref: 'Wholseller' })
  buyersPhone: string;

  @Prop({ required: true, ref: 'Wholseller' })
  buyersPlace: string;

  @Prop({ required: true, ref: 'Wholseller' })
  buyersAddress: string;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId })
  createdBy: CreatedBy;

  @Prop({ required: true })
  total_cost: number;

  @Prop({ required: true, unique: true })
  orderId: string;

  @Prop({ required: true })
  status: Status[];
}

export const OrdersSchema = SchemaFactory.createForClass(Orders);

// {
//   products: [{
//     price_wholesale: "10.00",
//     price_retail: "20.00",
//     name: "Product 1",
//     _id: "1",
//     qty: 2
//   }],
//   Wholesaler: ["5e9f8f8f8f8f8f8f8f8f8f8f","5e9f8f8f8f8f8f8f8f8f8f8f"],
//   createdBy: "5e9f8f8f8f8f8f8f8f8f8f8f",
//   total: "20.00",

// }
