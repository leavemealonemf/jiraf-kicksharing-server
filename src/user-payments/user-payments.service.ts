import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { DbService } from 'src/db/db.service';

const DEFAULT_PAGE_SIZE = 10;

@Injectable()
export class UserPaymentsService {
  private readonly logger = new Logger(UserPaymentsService.name);

  constructor(private readonly dbService: DbService) {}

  async getUserPayments(userId: number, page: number) {
    const offset = (page - 1) * DEFAULT_PAGE_SIZE;
    const payments = await this.dbService.payment
      .findMany({
        skip: offset,
        take: DEFAULT_PAGE_SIZE,
        orderBy: {
          datetimeCreated: 'desc',
        },
        where: { userId: userId },
      })
      .catch((err) => {
        this.logger.error(err);
      });

    if (!payments) {
      throw new BadRequestException(
        'Ошибка. Не удалось получить историю платежей',
      );
    }

    return payments;
  }
}
