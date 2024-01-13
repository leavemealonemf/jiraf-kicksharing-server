import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { FranchiseService } from './franchise.service';
import { UpdateFranchiseDto } from './dto/update-franchise.dto';
import { CreateFranchiseDto } from './dto/create-franchise.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Franchise (Франшиза)')
@ApiBearerAuth()
@Controller('franchise')
export class FranchiseController {
  constructor(private readonly franchiseService: FranchiseService) {}

  // @Post()
  // create(@Body() dto: CreateFranchiseDto) {
  //   return this.franchiseService.create(dto);
  // }

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

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.franchiseService.remove(+id);
  // }
}
