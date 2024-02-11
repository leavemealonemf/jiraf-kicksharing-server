import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({ default: 'new pass here' })
  password: string;
  @ApiProperty({ default: 'paste token here' })
  token: string;
}
