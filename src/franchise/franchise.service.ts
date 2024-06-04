import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { CreateFranchiseDto } from './dto/create-franchise.dto';
import { UpdateFranchiseDto } from './dto/update-franchise.dto';
import { DbService } from 'src/db/db.service';
import { AuthService } from 'src/auth/auth.service';
import { ConnectOwnerToFranchiseDto } from './dto';
import { CityService } from 'src/city/city.service';

@Injectable()
export class FranchiseService {
  private readonly logger = new Logger(FranchiseService.name);

  constructor(
    private readonly dbService: DbService,
    private readonly authService: AuthService,
    private readonly cityService: CityService,
  ) {}

  async create(dto: CreateFranchiseDto) {
    const city = await this.cityService.create(dto.cityCreateData);

    const franchise = await this.dbService.franchise
      .create({
        data: {
          legalAddress: dto.legalAddress,
          organization: dto.organization,
          youKassaAccount: dto.youKassaAccount,
          cityId: city.id,
          priceForScooterMonth: dto.priceForScooterMonth,
          taxpayerIdNumber: dto.taxpayerIdNumber,
          workStatus: dto.workStatus,
        },
        include: {
          city: true,
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              role: true,
            },
          },
          _count: {
            select: {
              scooters: true,
            },
          },
        },
      })
      .catch((err) => {
        this.logger.error('Не удалось создать франшизу');
        this.logger.error(err);
      });

    if (!franchise) {
      throw new BadRequestException(
        'Не удалось создать франшизу с данными: ' + JSON.stringify(dto),
      );
    }
    return franchise;
  }

  async findAll() {
    return await this.dbService.franchise.findMany({
      orderBy: {
        id: 'desc',
      },
      include: {
        city: true,
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
          },
        },
        _count: {
          select: {
            scooters: true,
          },
        },
      },
    });
  }

  async findOne(id: number) {
    const franchise = await this.dbService.franchise
      .findFirst({
        where: { id: id },
        include: {
          _count: {
            select: {
              scooters: true,
            },
          },
          city: true,
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              role: true,
            },
          },
        },
      })
      .catch((err) => {
        this.logger.error(`Не удалось найти франшизу с id: ${id}`);
        this.logger.error(err);
      });

    if (!franchise) {
      throw new BadRequestException(`Не удалось найти франшизу с id: ${id}`);
    }

    return franchise;
  }

  async update(id: number, dto: UpdateFranchiseDto) {
    await this.findOne(id);
    const updatedFranchise = await this.dbService.franchise
      .update({
        where: { id: id },
        data: {
          priceForScooterMonth: dto.priceForScooterMonth,
          workStatus: dto.workStatus,
        },
        include: {
          city: true,
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              role: true,
            },
          },
          _count: {
            select: {
              scooters: true,
            },
          },
        },
      })
      .catch((err) => {
        this.logger.error(`Не удалось обновить франшизу с id: ${id}`);
        this.logger.error(err);
      });

    if (!updatedFranchise) {
      throw new BadRequestException(`Не удалось обновить франшизу с id: ${id}`);
    }

    return updatedFranchise;
  }

  async remove(id: number) {
    await this.findOne(id);
    return await this.dbService.franchise
      .delete({ where: { id: id } })
      .catch((err) => {
        this.logger.error(`Не удалось удалить франшизу с id: ${id}`);
        this.logger.error(err);
        throw new BadRequestException(
          `Не удалось удалить франшизу с id: ${id}`,
        );
      });
  }

  async connectOwnerToFranchise(dto: ConnectOwnerToFranchiseDto) {
    const owner = await this.authService.register(dto.registerInfo);
    return await this.dbService.franchise
      .update({
        include: {
          city: true,
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              role: true,
            },
          },
          _count: { select: { scooters: true } },
        },
        where: { id: dto.franchiseId },
        data: {
          ownerId: owner.id,
        },
      })
      .catch((err) => {
        this.logger.error(
          `Не удалось привязать руководителя к франшизе с id: ${
            dto.franchiseId
          } и данными пользователя: ${JSON.stringify(dto.registerInfo)}`,
        );
        this.logger.error(err);
      });
  }
}
