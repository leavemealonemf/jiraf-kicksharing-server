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
import { AcquiringProcessPaymentDto, SaveAcquiringMethodDto } from './dtos';
import { CurrentUser, Platforms, Public } from '@common/decorators';
import { PlatformsGuard } from 'src/auth/guards/platform.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AcquiringSaveMethodFabric } from './gateways';
import { PaymentsService } from 'src/payments/payments.service';
import { AcquiringPaymentStatusDto } from './dtos/acquiring-payment.response.dto';
import { PaymentMethodService } from 'src/payment-method/payment-method.service';

@ApiTags('Эквайринг')
@Controller('acquiring')
export class AcquiringController {
  constructor(
    private readonly acquiringService: AcquiringService,
    private readonly saveAcquiringFabric: AcquiringSaveMethodFabric,
    private readonly paymentsService: PaymentsService,
    private readonly paymentMethodService: PaymentMethodService,
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

    const isPaymentSaveInDB = await this.paymentMethodService.savePaymentMethod(
      isAcquiringMethodSave,
      user.id,
    );

    if (!isPaymentSaveInDB) {
      throw new BadGatewayException('Не удалось сохранить платежный метод');
    }

    return isAcquiringMethodSave;
  }

  @ApiBearerAuth()
  @UseGuards(PlatformsGuard)
  @Platforms('MOBILE')
  @Post('/create-aquiring-payment')
  async createAquiringProcessPayment(
    @Body() dto: AcquiringProcessPaymentDto,
    @CurrentUser() user: any,
  ) {
    const payment = await this.acquiringService.processPayment(dto);

    if (!payment) {
      throw new BadRequestException('Не удалось обработать платеж');
    }

    return await this.paymentsService.savePayment(dto, user.id);
  }

  @Public()
  @Post('/get-aquiring-status')
  async getAquiringPaymentStatus(@Body() dto: AcquiringPaymentStatusDto) {
    await this.paymentMethodService.agreementPaymentMethodPhase(dto);
  }
}
