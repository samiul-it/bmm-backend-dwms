import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class CreateSubCategoryDto {
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