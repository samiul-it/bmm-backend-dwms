import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsNotEmpty()
  category?: string;

  @IsPhoneNumber('IN')
  phone: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  @MaxLength(18)
  password: string;

  @IsIn([
    'user',
    'coloringArtist',
    'croppingArtist',
    'correctionArtist',
    'admin',
    'processManager',
    'productionManager',
    'sellsManager',
    'shipmentExecutive',
    'processExecutive',
    'productionExecutive',
    'accountsExecutive',
  ])
  role: string;
}
