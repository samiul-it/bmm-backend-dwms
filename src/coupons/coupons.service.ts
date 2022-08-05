import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Coupon, CouponDocument } from './coupon.schema';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { EditCouponDto } from './dto/edit-coupon.dto';

@Injectable()
export class CouponsService {
  constructor(
    @InjectModel(Coupon.name) private couponModel: Model<CouponDocument>,
  ) {}

  async createCoupon(couponDto: CreateCouponDto) {
    const exists = await this.couponModel.findOne({ code: couponDto.code });
    if (exists)
      throw new BadRequestException('Coupon with this code already exists');
    return await new this.couponModel(couponDto).save().catch((err) => {
      throw new InternalServerErrorException(err, 'Coupon Creation Faileds');
    });
  }

  async getPublicCoupons() {
    return await this.couponModel
      .find({
        isHidden: false,
        active: true,
        // validUpto: {
        //   $gte: new Date(),
        // },
      })
      .catch((err) => {
        throw new InternalServerErrorException(
          err,
          'Unable to get all coupons',
        );
      });
  }

  async getAllCoupons(page: number) {
    const coupons = await this.couponModel.find().catch((err) => {
      throw new InternalServerErrorException(err, 'Unable to get all coupons');
    });
    if (page) {
      const results = {};
      const limit = 15;
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      if (endIndex < coupons.length) {
        results['next'] = Number(page) + 1;
      }
      if (startIndex > 0) {
        results['previous'] = Number(page - 1);
      }
      results['page'] = Number(page);
      results['data'] = coupons.slice(startIndex, endIndex);
      return { ...results };
    } else {
      return coupons;
    }
  }

  async getCouponByCode(code: string) {
    const coupon = await this.couponModel.findOne({
      code,
      active: true,
      // validUpto: {
      //   $gte: new Date(),
      // },
    });
    if (!coupon)
      throw new NotFoundException('Please enter a valid coupon code');
    return coupon;
  }
  async getAllCouponsForProduct(sku: string) {
    const coupon = await this.couponModel.find({
      active: true,
      hidden: false,
      // validUpto: {
      //   $gte: new Date(),
      // },
    });
    const cop = coupon.filter((c) => c.productSku.includes(sku));
    return cop;
  }

  async toggleCoupon(couponId: string) {
    const coupon = await this.couponModel.findById(couponId);
    if (!coupon) throw new NotFoundException('Coupon with not found');

    coupon.active = !coupon.active;
    return await coupon.save().catch((err) => {
      throw new InternalServerErrorException(err, 'Coupon Update Failed');
    });
  }
  async hideCoupon(couponId: string) {
    const coupon = await this.couponModel.findById(couponId);
    if (!coupon) throw new NotFoundException('Coupon with not found');

    coupon.isHidden = !coupon.isHidden;
    return await coupon.save().catch((err) => {
      throw new InternalServerErrorException(err, 'Coupon Update Failed');
    });
  }

  async editCoupon(couponId: string, couponData: EditCouponDto) {
    // console.log('data', couponData);
    const exists = await this.couponModel.findById(couponId);
    if (!exists) throw new NotFoundException('Coupon with not found');
    return await this.couponModel
      .findByIdAndUpdate(couponId, { $set: { ...couponData } })
      .catch((err) => {
        throw new InternalServerErrorException(err, 'Coupon Update Failed');
      });
  }

  async deleteCoupon(couponId: string) {
    const exists = await this.couponModel.findById(couponId);
    if (!exists) throw new NotFoundException('Coupon with not found');
    return await this.couponModel.findByIdAndDelete(couponId).catch((err) => {
      throw new InternalServerErrorException(err, 'Unable to delete coupon');
    });
  }
}
