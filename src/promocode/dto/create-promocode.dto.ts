import { ApiProperty } from '@nestjs/swagger';
import { PromocodeStatus, PromocodeType } from '@prisma/client';
import { IsNotEmpty } from 'class-validator';

export class CreatePromocodeDto {
  @ApiProperty({ default: 'START' })
  @IsNotEmpty({
    message: 'Поле code не должно быть пустым',
  })
  code: string;
  @ApiProperty({ default: '100' })
  @IsNotEmpty({
    message: 'Поле sum не должно быть пустым',
  })
  sum: string;
  @ApiProperty({ default: new Date() })
  @IsNotEmpty({
    message: 'Поле dateStart не должно быть пустым',
  })
  dateStart: Date;
  @ApiProperty({ default: new Date() })
  @IsNotEmpty({
    message: 'Поле dateEnd не должно быть пустым',
  })
  dateEnd: Date;
  @ApiProperty({ default: PromocodeType.BALANCE })
  type: PromocodeType;
  @ApiProperty({ default: PromocodeStatus.ACTIVE })
  status: PromocodeStatus;
}
