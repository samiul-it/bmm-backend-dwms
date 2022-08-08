import { PartialType } from '@nestjs/mapped-types';
import { IsString, MaxLength, MinLength } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserPassDto extends PartialType(CreateUserDto) {
  @IsString()
  @MinLength(6)
  @MaxLength(18)
  newPassword: string;
}
