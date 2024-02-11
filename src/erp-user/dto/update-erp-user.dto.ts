import { PartialType } from '@nestjs/mapped-types';
import { CreateErpUserDto } from './create-erp-user.dto';
import { $Enums } from '@prisma/client';

export class UpdateErpUserDto extends PartialType(CreateErpUserDto) {
  avatar?: string;
  password?: string;
  status?: $Enums.ErpUserStatus;
}
