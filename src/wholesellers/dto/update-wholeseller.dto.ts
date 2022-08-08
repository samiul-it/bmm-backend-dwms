import { PartialType } from '@nestjs/mapped-types';
import { IsString, MaxLength, MinLength } from 'class-validator';
import { CreateWholesellerDto } from './create-wholeseller.dto';

export class UpdateWholesellerDto extends PartialType(CreateWholesellerDto) {
  @IsString()
  @MinLength(6)
  @MaxLength(18)
  newPassword: string;
}
