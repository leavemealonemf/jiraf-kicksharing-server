import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { DbService } from 'src/db/db.service';
import { CreateFineDto } from './dto';
import { ErpUser, ErpUserRoles } from '@prisma/client';
import { generateUUID } from '@common/utils';
import { FineCauseEnum } from './enums';

@Injectable()
export class FineService {
  private readonly logger = new Logger(FineService.name);

  constructor(private readonly dbService: DbService) {}

  async getAll() {
    return await this.dbService.fine.findMany({
      include: {
        initiator: {
          include: {
            city: {
              select: { name: true },
            },
          },
        },
        intruder: true,
        trip: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(dto: CreateFineDto, erpUser: ErpUser) {
    const isAccess = this.checkRolePermisson(
      erpUser.role,
      erpUser.franchiseEmployeeId,
    );

    if (!isAccess) {
      throw new BadRequestException(
        'У вас недостаточно прав для выполнения этой операции',
      );
    }

    const fineUUID = generateUUID();

    const trip = await this.dbService.trip
      .findFirst({
        where: { tripId: dto.tripUUID },
        select: {
          id: true,
          userId: true,
          scooter: {
            select: { franchiseId: true },
          },
        },
      })
      .catch((err) => {
        this.logger.error(err);
      });

    if (!trip) {
      throw new BadRequestException(
        `Не удалось найти поездку ${dto.tripUUID} для создания штрафа`,
      );
    }

    if (trip.scooter.franchiseId !== erpUser.franchiseEmployeeId) {
      throw new BadRequestException(
        'У вас недостаточно прав для выполнения этой операции',
      );
    }

    const causeTxt: string = FineCauseEnum[dto.causeType];

    return await this.dbService.fine
      .create({
        include: {
          initiator: {
            include: {
              city: {
                select: { name: true },
              },
            },
          },
          intruder: true,
          trip: true,
        },
        data: {
          tripUUID: dto.tripUUID,
          deviceType: dto.deviceType,
          causeType: dto.causeType,
          causeText: causeTxt,
          description: dto.description,
          // photos: dto.photos,
          price: dto.price,
          fineNumber: fineUUID,
          initiatorId: erpUser.franchiseEmployeeId,
          intruderId: trip.userId,
          tripId: trip.id,
        },
      })
      .catch((err) => {
        this.logger.error(err);
        throw new BadRequestException(
          'Не удалось создать штраф с данными: ' + JSON.stringify(dto),
        );
      });
  }

  private saveImages() {
    return null;
  }

  private checkRolePermisson(role: ErpUserRoles, franchiseId: number): boolean {
    if (role === 'FRANCHISE' && franchiseId) {
      return true;
    }
    return false;
  }
}
