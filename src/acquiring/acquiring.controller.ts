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
import { ReccurentPaymentDto, SaveAcquiringMethodDto } from './dtos';
import { CurrentUser, Platforms, Public } from '@common/decorators';
import { PlatformsGuard } from 'src/auth/guards/platform.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AcquiringSaveMethodFabric } from './gateways';
import { PaymentsService } from 'src/payments/payments.service';
import { AcquiringPaymentStatusDto } from './dtos/acquiring-payment.response.dto';
import { PaymentMethodService } from 'src/payment-method/payment-method.service';
import { TransactionStatus } from 'cloudpayments';
import { IPaymentJsonData } from './gateways-provider/cloudpayments/interfaces/payment-jsondata.interface';
import { Franchise, Trip, User } from '@prisma/client';
import { IDefaultTransactionNotification } from './gateways-provider/cloudpayments/interfaces';
import { DbService } from 'src/db/db.service';

@ApiTags('Эквайринг')
@Controller('acquiring')
export class AcquiringController {
  constructor(
    private readonly acquiringService: AcquiringService,
    private readonly saveAcquiringFabric: AcquiringSaveMethodFabric,
    private readonly paymentsService: PaymentsService,
    private readonly paymentMethodService: PaymentMethodService,
    private readonly dbService: DbService,
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

  // @ApiBearerAuth()
  // @UseGuards(PlatformsGuard)
  // @Platforms('MOBILE')
  // @Post('/create-aquiring-payment')
  // async createAquiringProcessPayment(
  //   @Body() dto: AcquiringProcessPaymentDto,
  //   @CurrentUser() user: any,
  // ) {
  //   const payment = await this.acquiringService.processPayment(dto);

  //   if (!payment) {
  //     throw new BadRequestException('Не удалось обработать платеж');
  //   }

  //   return await this.paymentsService.savePayment(dto, user.id);
  // }

  @Public()
  @Post('/get-aquiring-status')
  async getAquiringPaymentStatus(@Body() dto: AcquiringPaymentStatusDto) {
    console.log(dto);
    await this.paymentMethodService.agreementPaymentMethodPhase(dto);
  }

  @Post('/cloudpayments-create-payment-method')
  async createPaymentMethodCloudPayments(@CurrentUser() user: User) {
    const franchise = await this.findCurrentFranchise();

    const dbUser = await this.dbService.user.findFirst({
      where: { id: user.id },
    });

    if (!dbUser) {
      throw new BadRequestException(
        'Не удалось привязать платежный метод. Пользователь не найден',
      );
    }

    return await this.acquiringService.createAuthorizedPaymentMethod(
      dbUser,
      franchise.youKassaAccount,
      franchise.cloudpaymentsKey,
    );
  }

  @ApiBearerAuth()
  @UseGuards(PlatformsGuard)
  @Platforms('MOBILE')
  @Post('/cloudpayments-reccurent-payment')
  async createCassirReccurentPayment(
    @Body() dto: ReccurentPaymentDto,
    @CurrentUser() userRes: User,
  ) {
    const paymentMethod =
      await this.paymentMethodService.getActivePaymentMethod(userRes.id);

    const franchise = await this.findCurrentFranchise();

    const reccurentPayment = await this.acquiringService.createReccurentPayment(
      dto,
      userRes.id,
      paymentMethod,
      franchise.youKassaAccount,
      franchise.cloudpaymentsKey,
    );

    const payment = await this.paymentsService.savePayment(
      dto,
      userRes.id,
      paymentMethod,
    );

    const res = await Promise.all([reccurentPayment, payment]);
    return res[1];
  }

  @ApiBearerAuth()
  @UseGuards(PlatformsGuard)
  @Platforms('MOBILE')
  @Post('/cloudpayments-reccurent-payment-two-stage')
  async createCassirReccurentPaymentTwoStage(
    @Body() dto: ReccurentPaymentDto,
    @CurrentUser() userRes: User,
  ) {
    const paymentMethod =
      await this.paymentMethodService.getActivePaymentMethod(userRes.id);

    const franchise = await this.findCurrentFranchise();

    const reccurentPayment =
      await this.acquiringService.createReccurentPaymentTwoStage(
        dto,
        userRes.id,
        paymentMethod,
        franchise.youKassaAccount,
        franchise.cloudpaymentsKey,
      );

    // const payment = await this.paymentsService.savePayment(
    //   dto,
    //   userRes.id,
    //   paymentMethod,
    // );

    return reccurentPayment;
  }

  @Public()
  @Post('cloudcassir-payment-info')
  async cassirPaymentInfo(@Body() dto: IDefaultTransactionNotification) {
    console.log('PAY NOTIFICATION ENDPOINT:');
    console.log(dto);

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

      const franchise = await this.findCurrentFranchise();

      const cancelPayment = await this.acquiringService.voidPayment(
        {
          TransactionId: Number(dto.TransactionId),
        },
        franchise.youKassaAccount,
        franchise.cloudpaymentsKey,
      );
      console.log(cancelPayment);
    }
    // return await this.acquiringService.getCloudCassirPaymentInfo(data);
  }
  @Public()
  @Post('cloudcassir-payment-info-check')
  async cassirPaymentInfoCheck(@Body() dto: IDefaultTransactionNotification) {
    console.log(dto);
  }

  @Public()
  @Post('cloudpayment-receipt-notifications')
  async getCloudpaymentsReceiptNotifications(@Body() dto: any) {
    console.log('В обработчике уведомления чека');
    console.log(dto);
    // Receipt.ReceiptLocalUrl
    const entity = await this.getEntityWhereTransactonIdEqual(
      dto.TransactionId,
    );

    console.log('ENTITY:', entity);

    await this.updateEntityWhereTransactionIdEqual(
      entity,
      dto.Receipt.ReceiptLocalUrl,
    );
  }

  private async updateEntityWhereTransactionIdEqual(
    entity: Trip,
    receiptUrl: string,
  ) {
    // for now we only update trip information, but there will be more of this method in the future

    console.log('в методе обновления поездки');
    await this.dbService.trip
      .update({
        where: { id: entity.id },
        data: {
          receiptUrl: receiptUrl,
        },
      })
      .then((res) => {
        console.log('RECEIPT SUCCESSFULLY SAVED');
        console.log('RECEIPT_URL', res.receiptUrl);
      })
      .catch((err) => {
        console.log(err);
        throw new BadRequestException(
          'Не удалось присвоить receiptUrl переданной сущности',
        );
      });
  }

  private async getEntityWhereTransactonIdEqual(transactionId: string) {
    // for now we only get trip information, but there will be more of this method in the future
    console.log('в методе поиска поездки');
    const entity: any = await this.dbService.$queryRaw`
      SELECT * FROM "Trip"
      WHERE "paymentData"->>'transactionId' = ${transactionId}
    `.catch((err) => {
      console.log(err);
    });

    if (!entity) {
      throw new BadRequestException(
        'Не удалось найти сущность по переданной транзакции',
      );
    }

    return entity;
  }

  private async findCurrentFranchise(): Promise<Franchise> {
    const franchise = await this.dbService.franchise
      .findFirst({
        where: { youKassaAccount: 'pk_42204cdc701ea748b587162053789' },
        include: {
          city: true,
        },
      })
      .catch((err) => {
        console.log(err);
      });

    if (!franchise) {
      throw new BadRequestException(
        'ACQUIRING: Не удалось опеределить франчайзера',
      );
    }

    return franchise;
  }
}
