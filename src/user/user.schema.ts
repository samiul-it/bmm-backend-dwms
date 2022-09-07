// import { UseGuards } from '@nestjs/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

// export type AdreessDocument = Address & Document;

// @Schema({ timestamps: true })
// export class Address {
//   @Prop({ required: false, default: new Date() })
//   _id: string;

//   @Prop({ required: true })
//   fullAddress: string;

//   @Prop({ length: 6 })
//   pincode: string;

//   @Prop({ required: true })
//   city: string;

//   @Prop({ required: true })
//   state: string;

//   @Prop({ required: false })
//   name?: string;

//   @Prop({ required: true })
//   phone: string;

//   @Prop()
//   whatsapp: string;

//   @Prop({ required: false })
//   email?: string;

//   @Prop()
//   type: string;
// }

// class RewardPoints {
//   points: number;
//   pointsEarned: number;
//   ponitsUsed: number;
// }

@Schema({ timestamps: true })
export class User {
  @Prop()
  name: string;

  @Prop({ required: false })
  alias?: string;

  @Prop({ unique: true, required: true })
  phone: string;

  @Prop()
  whatsapp: string;

  @Prop({ required: false })
  email?: string;

  @Prop({ required: false })
  password?: string;

  @Prop({
    required: true,
    default: 'admin',
    enum: ['admin', 'employee'],
  })
  role?: string;
}

//   @Prop({
//     default: [],
//     required: false,
//   })
//   address?: Address[];

//   @Prop({ required: false })
//   category?: string;

//   @Prop()
//   rewardPoints: RewardPoints;

//   @Prop({ default: true, required: false })
//   isActive?: boolean;
// }

export const UserSchema = SchemaFactory.createForClass(User);
