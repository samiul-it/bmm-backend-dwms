import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsNumber,
  ArrayNotEmpty,
  ValidateNested,
  IsMongoId,
  IsOptional,
} from 'class-validator';

export class UpdateSubCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsNumber()
  @IsNotEmpty()
  product: number;

  @IsString()
  @IsNotEmpty()
  imageLink: string;

  @IsMongoId()
  cateogry: string;

  @IsOptional()
  description?: string;

  @IsNotEmpty()
  @IsNumber()
  discount_wholesale: number

  @IsNotEmpty()
  @IsNumber()
  discount_retail: number
}