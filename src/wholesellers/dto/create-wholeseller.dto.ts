import { IsNotEmpty, IsString } from "class-validator";

export class Attributes {
  name: string;
  value: string;
}

export class CreateWholesellerDto {

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsString()
  email: string;


  @IsString()
  @IsNotEmpty()
  phone: string;



  @IsNotEmpty()
  @IsString()
  role: string;

  @IsNotEmpty()
  @IsString()
  name: string;


  @IsString()
  catagories: string;

}
