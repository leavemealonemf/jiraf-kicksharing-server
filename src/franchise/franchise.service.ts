import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { CreateFranchiseDto } from './dto/create-franchise.dto';
import { UpdateFranchiseDto } from './dto/update-franchise.dto';
import { DbService } from 'src/db/db.service';

@Injectable()
export class FranchiseService {
  private readonly logger = new Logger(FranchiseService.name);

  constructor(private readonly dbService: DbService) {}

  async create(dto: CreateFranchiseDto) {
    const franchise = await this.dbService.franchise
      .create({ data: dto })
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
    return await this.dbService.franchise.findMany();
  }

  async findOne(id: number) {
    const franchise = await this.dbService.franchise
      .findFirst({
        where: { id: id },
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
}
