import { Controller, Get, Body, Patch, Param } from '@nestjs/common';
import { FranchiseService } from './franchise.service';
import { UpdateFranchiseDto } from './dto/update-franchise.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Franchise (Франшиза)')
@ApiBearerAuth()
@Controller('franchise')
export class FranchiseController {
  constructor(private readonly franchiseService: FranchiseService) {}

  @Get()
  findAll() {
    return this.franchiseService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.franchiseService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateFranchiseDto: UpdateFranchiseDto,
  ) {
    return this.franchiseService.update(+id, updateFranchiseDto);
  }
}
