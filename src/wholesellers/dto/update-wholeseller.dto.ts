import { PartialType } from '@nestjs/mapped-types';
import { CreateWholesellerDto } from './create-wholeseller.dto';

export class UpdateWholesellerDto extends PartialType(CreateWholesellerDto) {}
