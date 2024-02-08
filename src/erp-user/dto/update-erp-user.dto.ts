import { PartialType } from '@nestjs/mapped-types';
import { CreateErpUserDto } from './create-erp-user.dto';

export class UpdateErpUserDto extends PartialType(CreateErpUserDto) {
  avatar?: string;
}
