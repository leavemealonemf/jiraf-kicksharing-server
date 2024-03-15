import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { PromocodeService } from './promocode.service';
import { CreatePromocodeDto } from './dto/create-promocode.dto';
import { UpdatePromocodeDto } from './dto/update-promocode.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser, Platforms } from '@common/decorators';
import { PlatformsGuard } from 'src/auth/guards/platform.guard';
import { UsePromocodeDto } from './dto/use-promocode.dto';

@ApiTags('Promocodes (Промокоды)')
@ApiBearerAuth()
@Controller('promocode')
export class PromocodeController {
  constructor(private readonly promocodeService: PromocodeService) {}

  @UseGuards(PlatformsGuard)
  @Platforms('WEB')
  @Post()
  create(@Body() createPromocodeDto: CreatePromocodeDto) {
    return this.promocodeService.create(createPromocodeDto);
  }

  @UseGuards(PlatformsGuard)
  @Platforms('MOBILE')
  @Post('/use')
  async usePromocode(
    @Body() usePromocodeDto: UsePromocodeDto,
    @CurrentUser() user: any,
  ) {
    const { code } = usePromocodeDto;

    return this.promocodeService.usePromocode(user.clientId, code);
  }

  @UseGuards(PlatformsGuard)
  @Platforms('WEB')
  @Get()
  findAll() {
    return this.promocodeService.findAll();
  }

  @UseGuards(PlatformsGuard)
  @Platforms('WEB')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.promocodeService.findOne(+id);
  }

  @UseGuards(PlatformsGuard)
  @Platforms('WEB')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePromocodeDto: UpdatePromocodeDto,
  ) {
    return this.promocodeService.update(+id, updatePromocodeDto);
  }

  @UseGuards(PlatformsGuard)
  @Platforms('WEB')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.promocodeService.remove(+id);
  }
}
