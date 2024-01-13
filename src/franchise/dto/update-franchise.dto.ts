import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateFranchiseDto } from './create-franchise.dto';

export class UpdateFranchiseDto extends PartialType(CreateFranchiseDto) {
  @ApiProperty({ default: 'Орёл' })
  city?: string;
  @ApiProperty({ default: 15000 })
  income?: number;
}
