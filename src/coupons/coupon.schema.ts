import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CouponDocument = Coupon & Document;

@Schema({ timestamps: true })
export class Coupon {
  @Prop({ required: true })
  productSku: string[];

  @Prop({ required: true, unique: true })
  code: string;

  @Prop()
  text?: string;

  @Prop({ required: true })
  amount: number;

  // minimum order value
  @Prop()
  minOrderAmount: number;

  // maximum discount
  @Prop()
  maxDiscount: number;

  @Prop({ default: true })
  active?: boolean;

  @Prop({ default: false })
  isHidden?: boolean;

  @Prop({ default: false })
  oneTimeOnly?: boolean;

  @Prop({ required: false })
  allowedPhoneNumbers?: string[];

  @Prop()
  validUpto: Date;
}

export const CouponSchema = SchemaFactory.createForClass(Coupon);
