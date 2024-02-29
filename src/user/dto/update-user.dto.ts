import { PartialType, ApiProperty } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { UserStatus } from '@prisma/client';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty({ default: 'vano@bk.ru' })
  email?: string;
  @ApiProperty({ default: UserStatus.ACTIVE })
  status?: UserStatus;
  @ApiProperty({ default: 'Ваня' })
  name?: string;
  @ApiProperty({ default: '1' })
  activePaymentMethod?: number;
  @ApiProperty({ default: 100.2 })
  balance?: number;
}
