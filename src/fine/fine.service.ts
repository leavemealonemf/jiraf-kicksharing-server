import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { DbService } from 'src/db/db.service';
import { CreateFineDto } from './dto';
import { ErpUser, ErpUserRoles } from '@prisma/client';
import { generateUUID } from '@common/utils';
import { FineCauseEnum } from './enums';
import * as path from 'path';
import * as fs from 'fs';
import { v4 } from 'uuid';

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
        trip: {
          include: {
            scooter: {
              select: {
                deviceId: true,
              },
            },
          },
        },
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

    // save images
    const photos: string[] = [];

    if (dto.photos.length > 0) {
      const res = this.saveImage(dto.photos, fineUUID);
      photos.push(...res);
    }

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
          trip: {
            include: {
              scooter: {
                select: {
                  deviceId: true,
                },
              },
            },
          },
        },
        data: {
          tripUUID: dto.tripUUID,
          deviceType: dto.deviceType,
          causeType: dto.causeType,
          causeText: causeTxt,
          description: dto.description,
          photos: photos,
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

  async delete(id: number, erpUser: ErpUser) {
    const isAccess = this.checkRoleDeleteFinePermisson(
      erpUser.role,
      erpUser.franchiseEmployeeId,
    );

    if (!isAccess) {
      throw new BadRequestException(
        'У вас недостаточно прав для выполнения этой операции',
      );
    }

    const fine = await this.dbService.fine
      .findFirst({ where: { id: id } })
      .catch((err) => {
        this.logger.error(err);
      });

    if (!fine) {
      throw new BadRequestException(`Не удалось найти штраф ${id}`);
    }

    const deleted = await this.dbService.fine
      .delete({ where: { id: id } })
      .catch((err) => {
        this.logger.error(err);
      });

    if (!deleted) {
      throw new BadRequestException(`Не удалось удалить штраф ${id}`);
    }

    if (deleted.photos.length > 0) {
      this.deleteFolder(deleted.fineNumber);
    }

    return deleted;
  }

  private saveImage(photos: string[], folderNameId: string): string[] {
    const imagesPaths = [];

    for (const photo of photos) {
      if (!photo) continue;

      const uuidName = v4();

      const entityPath = `uploads/images/fines/${folderNameId}/photo/${uuidName}.png`;

      const base64String = photo;
      const matches = base64String.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      const base64Data = matches[2];
      const buffer = Buffer.from(base64Data, 'base64');

      const filePath = entityPath;

      const directoryPath = path.dirname(filePath);
      if (!fs.existsSync(directoryPath)) {
        fs.mkdirSync(directoryPath, { recursive: true });
      }

      fs.writeFileSync(filePath, buffer);

      imagesPaths.push(entityPath);
    }
    return imagesPaths;
  }

  private deleteFolder(folderNameId: string) {
    fs.rmSync(`uploads/images/fines/${folderNameId}`, {
      recursive: true,
    });
  }

  private checkRolePermisson(role: ErpUserRoles, franchiseId: number): boolean {
    if (role === 'FRANCHISE' && franchiseId) {
      return true;
    }
    return false;
  }

  private checkRoleDeleteFinePermisson(
    role: ErpUserRoles,
    franchiseId: number,
  ): boolean {
    if (role === 'ADMIN') {
      return true;
    }

    if (role === 'FRANCHISE' && franchiseId) {
      return true;
    }
    return false;
  }
}
