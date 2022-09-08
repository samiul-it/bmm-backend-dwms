import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoryrequestDto } from './create-categoryrequest.dto';

export class UpdateCategoryrequestDto extends PartialType(CreateCategoryrequestDto) {}
