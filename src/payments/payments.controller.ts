import { Controller, Post, Get, Body, Delete, Param } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '@common/decorators';
import { AddPaymentMethodDto } from './dto/add-payment-method.dto';
import { PaymentStatusDto } from './dto/payment-status.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Public()
@ApiTags('Payments (Платежи)')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('add-payment-method')
  async addPaymentMethod(@Body() dto: AddPaymentMethodDto) {
    return this.paymentsService.addPaymentMethod(dto);
  }

  @Post('create-payment')
  async createPayment(@Body() dto: CreatePaymentDto) {
    const payment = await this.paymentsService.createPayment(dto);
    return payment;
  }

  @Get('/cassa')
  async getPayment() {
    return await this.paymentsService.getPayment();
  }

  @Get('/cassa/receipt')
  async getReceipt() {
    return await this.paymentsService.getReceipt();
  }

  @Get()
  async getAllPayments() {
    return await this.paymentsService.getAllPayments();
  }

  @Delete(':id')
  async deletePayment(@Param('id') id: string) {
    return await this.paymentsService.deletePayment(+id);
  }
  // @Get('get-payment')
  // async getPayment() {
  //   return this.paymentsService.getPayment();
  // }

  @Post('get-payment-status')
  async getPaymentStatus(@Body() dto: PaymentStatusDto) {
    return this.paymentsService.getPaymentStatus(dto);
  }

  // @Get('capture-payment')
  // async capturePayment() {
  //   return this.paymentsService.capturePayment();
  // }

  // @Get('cancel-payment')
  // async cancelPayment() {
  //   const payment = await this.paymentsService.cancelPayment();
  //   if (!payment) {
  //     throw new BadRequestException('Ошибка при отмене платежа');
  //   }
  //   return payment;
  // }
}
