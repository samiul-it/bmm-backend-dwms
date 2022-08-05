import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CouponsService } from './coupons.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { EditCouponDto } from './dto/edit-coupon.dto';

@Controller('coupons')
export class CouponsController {
  constructor(private couponService: CouponsService) {}

  @Get('/')
  async getPublicCoupons() {
    return await this.couponService.getPublicCoupons();
  }

  @Get('/all')
  async getAllCoupons(@Query('page') page: number) {
    return await this.couponService.getAllCoupons(page);
  }

  @Get('/forproduct/:sku')
  async getAllCouponsForProduct(@Param('sku') sku: string) {
    return await this.couponService.getAllCouponsForProduct(sku);
  }

  //   @Post('/:code')
  //   async getCouponByCode(@Param('code') code: string) {
  //     return await this.couponService.getCouponByCode(code);
  //   }

  @Post('/new')
  async createCoupon(@Body() couponDto: CreateCouponDto) {
    return await this.couponService.createCoupon(couponDto);
  }

  @Put('/toggle/:id')
  async toggleCoupon(@Param('id') id: string) {
    return await this.couponService.toggleCoupon(id);
  }
  @Put('/hide/:id')
  async hideCoupon(@Param('id') id: string) {
    return await this.couponService.hideCoupon(id);
  }

  @Put('/:id')
  async updateCoupon(
    @Param('id') id: string,
    @Body() couponDto: EditCouponDto,
  ) {
    return await this.couponService.editCoupon(id, couponDto);
  }

  @Delete('/:id')
  async deleteCoupon(@Param('id') id: string) {
    return await this.couponService.deleteCoupon(id);
  }
}
