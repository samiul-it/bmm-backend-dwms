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
export class UpdateUserRoleDto {
  @IsMongoId()
  userId: string;

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

export class UpdateUserDto {
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsNotEmpty()
  alias?: string;

  @IsOptional()
  @IsNotEmpty()
  category?: string;

  @IsPhoneNumber('IN')
  phone: string;

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
