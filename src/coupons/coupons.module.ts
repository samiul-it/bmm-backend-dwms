import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { Coupon, CouponSchema } from './coupon.schema';
import { CouponsController } from './coupons.controller';
import { CouponsService } from './coupons.service';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    MongooseModule.forFeature([
      {
        name: Coupon.name,
        schema: CouponSchema,
      },
    ]),
  ],
  controllers: [CouponsController],
  providers: [CouponsService],
})
export class CouponsModule {}
