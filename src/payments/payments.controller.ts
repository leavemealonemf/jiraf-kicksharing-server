import { Controller } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '@common/decorators';

@Public()
@ApiTags('Payments (Платежи)')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}
}
