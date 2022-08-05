import {
  IsEmail,
  IsIn,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
export class Attributes {
  name: string;
  value: string;
}
export class UpdateProductDto {
  @IsNotEmpty()
  product_name: string;

  @IsNotEmpty()
  product_desc: string;

  @IsString()
  @IsNotEmpty()
  slug: string;
  @IsOptional()
  imageLink: string;

  @IsMongoId()
  @IsNotEmpty()
  subcategory: string;

  @IsMongoId()
  @IsNotEmpty()
  category: string;

  @IsOptional()
  attributes: Attributes[]

  @IsNotEmpty()
  price_wholesale:number

  @IsNotEmpty()
  price_retail:number

  @IsNotEmpty()
  mrp:number
}