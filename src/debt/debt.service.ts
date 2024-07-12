import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Debt } from '@prisma/client';
import { DbService } from 'src/db/db.service';
import { CreateDebtDto } from './dto';
import { generateUUID } from '@common/utils';

interface IDebtService {
  getAll(): Promise<Debt[]>;
  create(dto: CreateDebtDto): Promise<Debt>;
}

@Injectable()
export class DebtService implements IDebtService {
  private readonly logger = new Logger(DebtService.name);

  constructor(private readonly dbService: DbService) {}

  async getAll(): Promise<Debt[]> {
    return await this.dbService.debt.findMany({
      include: {
        initiator: true,
        intruder: true,
        trip: true,
      },
    });
  }

  async create(dto: CreateDebtDto): Promise<Debt> {
    const trip = await this.dbService.trip
      .findFirst({
        where: { tripId: dto.tripUUID },
        select: {
          id: true,
          userId: true,
          scooter: {
            select: {
              franchiseId: true,
            },
          },
        },
      })
      .catch((err) => {
        this.logger.error(err);
      });

    if (!trip) {
      throw new BadRequestException(
        'Не удалось найти поездку для оформления задолженности',
      );
    }

    const genTripUUID = generateUUID();

    return await this.dbService.debt
      .create({
        data: {
          tripUUID: dto.tripUUID,
          price: dto.price,
          debtUUID: genTripUUID,
          initiatorId: trip.scooter.franchiseId,
          intruderId: trip.userId,
          tripId: trip.id,
        },
      })
      .catch((err) => {
        this.logger.error(err);
        throw new BadRequestException('Не удалось создать задолженность');
      });
  }
}
