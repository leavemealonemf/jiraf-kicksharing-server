import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateTariffDto } from './dto/create-tariff.dto';
import { UpdateTariffDto } from './dto/update-tariff.dto';
import { DbService } from 'src/db/db.service';

@Injectable()
export class TariffService {
  private logger = new Logger();

  constructor(private readonly dbService: DbService) {}

  async create(createTariffDto: CreateTariffDto) {
    return this.dbService.tariff
      .create({ data: createTariffDto })
      .catch((err) => {
        this.logger.error(err);
        return null;
      });
  }

  async findAll() {
    return this.dbService.tariff.findMany({
      orderBy: { orderInList: 'asc' },
    });
  }

  async findOne(id: number) {
    const tariff = await this.dbService.tariff.findFirst({ where: { id: id } });
    if (!tariff) {
      throw new NotFoundException(`Запись с id ${id} не найдена`);
    }
    return tariff;
  }

  async update(id: number, updateTariffDto: UpdateTariffDto) {
    const tariff = await this.dbService.tariff.findFirst({ where: { id: id } });

    if (!tariff) {
      throw new NotFoundException(`Запись с id ${id} не найдена`);
    }

    return this.dbService.tariff
      .update({ where: { id: id }, data: updateTariffDto })
      .catch((err) => {
        this.logger.error(err);
        return null;
      });
  }

  async remove(id: number) {
    const tariff = await this.dbService.tariff.findFirst({ where: { id: id } });
    if (!tariff) {
      throw new NotFoundException(
        `Не получается удалить. Записи с id ${id} не существует!`,
      );
    }
    return this.dbService.tariff.delete({ where: { id: id } }).catch((err) => {
      this.logger.error(err);
      return null;
    });
  }
}
