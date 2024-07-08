import {
  BadGatewayException,
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  Post,
  Request,
  Response,
  UseGuards,
} from '@nestjs/common';
import { AcquiringService } from './acquiring.service';
import { AcquiringProcessPaymentDto, SaveAcquiringMethodDto } from './dtos';
import { CurrentUser, Platforms, Public } from '@common/decorators';
import { PlatformsGuard } from 'src/auth/guards/platform.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AcquiringSaveMethodFabric } from './gateways';
import { PaymentsService } from 'src/payments/payments.service';
import {
  AcquiringPaymentEvent,
  AcquiringPaymentStatusDto,
} from './dtos/acquiring-payment.response.dto';
import { PaymentMethodService } from 'src/payment-method/payment-method.service';
import { TransactionStatus } from 'cloudpayments';
import { IPaymentJsonData } from './gateways-provider/cloudpayments/interfaces/payment-jsondata.interface';
import { User } from '@prisma/client';
import { IDefaultTransactionNotification } from './gateways-provider/cloudpayments/interfaces';

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
    console.log(dto);
    await this.paymentMethodService.agreementPaymentMethodPhase(dto);
  }

  // @Public()
  @Post('/cloudpayments-create-payment-method')
  async createPaymentMethodCloudPayments(@CurrentUser() user: User) {
    console.log(user);
    return await this.acquiringService.createAuthorizedPaymentMethod(
      user ? user.id : 1,
    );
  }

  @Public()
  @Post('/cloudcassir-reccurent-payment')
  async createCassirReccurentPayment() {
    return await this.acquiringService.createReccurentPayment();
  }

  @Public()
  @Post('cloudcassir-payment-info')
  async cassirPaymentInfo(@Body() dto: IDefaultTransactionNotification) {
    if (!dto.Data || !dto.Data.length) {
      console.log('PAYMENT JSON DATA IS EMPTY');
      return;
    }
    const providedData: IPaymentJsonData = JSON.parse(dto.Data);
    console.log(providedData.methodUuid);
    // void payment if is two-stage payment
    if (
      dto.Status === TransactionStatus.Authorized &&
      providedData.service === 'payment-method'
    ) {
      await this.paymentMethodService.agreementPaymentMehodCloudPayments(
        dto,
        providedData.userId,
      );

      const cancelPayment = await this.acquiringService.voidPayment({
        TransactionId: Number(dto.TransactionId),
      });
      console.log(cancelPayment);
    }
    // return await this.acquiringService.getCloudCassirPaymentInfo(data);
  }
  @Public()
  @Post('cloudcassir-payment-info-check')
  async cassirPaymentInfoCheck(@Body() dto: IDefaultTransactionNotification) {
    console.log(dto);
  }
}
