import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type OrdersDocument = Orders & Document;

class Buyers {
  type: mongoose.Schema.Types.ObjectId;
  ref: 'Users';
}

class CreatedBy {
  type: mongoose.Schema.Types.ObjectId;
  ref: 'Users';
}
class Product {
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

class Products {
  @Prop({ required: true })
  product: Product;
  @Prop({ required: true })
  quantity: number;
}

class Status {
  @Prop({ default: 'placed' })
  status: string;

  @Prop({ default: new Date() })
  createdAt: Date;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId })
  user: string;
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
  buyers: string;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId })
  createdBy: CreatedBy;

  @Prop({ required: true })
  total_cost: number;

  @Prop({ required: true, unique: true })
  orderId: string;

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
