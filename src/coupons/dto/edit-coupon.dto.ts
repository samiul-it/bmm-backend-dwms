import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsDate,
  IsNumber,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsMongoId,
} from 'class-validator';
import { Type } from 'class-transformer';
export class EditCouponDto {
  @IsArray()
  @ArrayNotEmpty()
  productSku: string[];

  @IsNotEmpty()
  code: string;

  @IsInt()
  @IsNumber()
  amount: number;

  @IsOptional()
  @IsNotEmpty()
  text?: string;

  @IsOptional()
  @IsInt()
  minOrderAmount?: number;

  @IsOptional()
  @IsInt()
  maxDiscount?: number;

  @IsOptional()
  allowedPhoneNumbers?: string[];

  @Type(() => Date)
  validUpto: Date;

  @IsBoolean()
  isHidden?: boolean;
}
