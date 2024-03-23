import {
  BadGatewayException,
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AcquiringService } from './acquiring.service';
import { SaveAcquiringMethodDto } from './dtos';
import { CurrentUser, Platforms, Public } from '@common/decorators';
import { PlatformsGuard } from 'src/auth/guards/platform.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AcquiringSaveMethodFabric } from './gateways';
import { PaymentsService } from 'src/payments/payments.service';
import { AcquiringPaymentStatusDto } from './dtos/acquiring-payment.response.dto';

@ApiTags('Эквайринг')
@Controller('acquiring')
export class AcquiringController {
  constructor(
    private readonly acquiringService: AcquiringService,
    private readonly saveAcquiringFabric: AcquiringSaveMethodFabric,
    private readonly paymentsService: PaymentsService,
  ) {}

  @ApiBearerAuth()
  @UseGuards(PlatformsGuard)
  @Platforms('MOBILE')
  @Post('/save-method')
  async saveAcquiringMethod(
    @CurrentUser() user: any,
    @Body() dto: SaveAcquiringMethodDto,
  ) {
    const gateway = this.saveAcquiringFabric.getGateway(dto);

    console.log(user);

    if (!gateway) {
      throw new ForbiddenException(
        'Такого платежного метода не существует ' + dto.paymentType,
      );
    }

    this.acquiringService.rigisterSaveAcquiringGateway(dto, gateway);

    const isAcquiringMethodSave =
      await this.acquiringService.saveAcquiringMethod(dto);

    if (!isAcquiringMethodSave) {
      throw new BadRequestException(
        dto.paymentType + ' - Данный платежный метод не поддерживается',
      );
    }

    const isPaymentSaveInDB = await this.paymentsService.savePaymentMethod(
      isAcquiringMethodSave,
      user.id,
    );

    if (!isPaymentSaveInDB) {
      throw new BadGatewayException('Не удалось сохранить платежный метод');
    }

    return isAcquiringMethodSave;
  }

  @Public()
  @Post('/get-aquiring-status')
  async getAquiringPaymentStatus(@Body() dto: AcquiringPaymentStatusDto) {
    await this.paymentsService.agreementPaymentMethodPhase(dto);
  }
}
