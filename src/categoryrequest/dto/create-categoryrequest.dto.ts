import { IsString } from 'class-validator';

export class Attributes {
  name: string;
  value: string;
}

export class CreateCategoryrequestDto {
  @IsString()
  wholesellerId: string;

  @IsString()
  categories: string;
}
