import {
  IsEmail,
  IsIn,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class createOrderDto {
  products: [
    {
      product: {
        _id: string;
        product_name: string;
        price_wholesale: number;
        price_retail: number;
        mrp: number;
      };

      quantity: number;
    },
  ];

  @IsNotEmpty()
  @IsNumber()
  @IsString()
  buyers: [];

  @IsMongoId()
  @IsNotEmpty()
  createdBy: string;

  @IsNotEmpty()
  @IsNumber()
  total_cost: number;

  
}
