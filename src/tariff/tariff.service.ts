import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { DbService } from 'src/db/db.service';
import { UpdateTariffOrdersDto, CreateTariffDto, UpdateTariffDto } from './dto';
import { Tariff } from '@prisma/client';

@Injectable()
export class TariffService {
  private logger = new Logger(TariffService.name);

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
      orderBy: { addedDate: 'desc' },
    });
  }

  async findOne(id: number) {
    const tariff = await this.dbService.tariff.findFirst({ where: { id: id } });
    if (!tariff) {
      throw new NotFoundException(`Запись с id ${id} не найдена`);
    }
    return tariff;
  }

  async getApplicationViewTariffs(): Promise<Tariff[]> {
    return await this.dbService.tariff
      .findMany({
        where: {
          status: 'ACTIVE',
        },
        orderBy: { orderInList: 'desc' },
      })
      .catch((err) => {
        this.logger.error(err);
        throw new BadRequestException('Не удалось получить видимые тарифы');
      });
  }

  async updateTariffsOrders(dto: UpdateTariffOrdersDto) {
    return await this.dbService.$transaction(async () => {
      try {
        for (const tariff of dto.tariffs) {
          await this.dbService.tariff.update({
            where: { id: tariff.id },
            data: {
              orderInList: tariff.status === 'ACTIVE' ? tariff.orderInList : 0,
            },
          });
        }
      } catch (error) {
        this.logger.error(error);

        throw new BadRequestException(
          'Не удалось поменять позиции элементов: ' + JSON.stringify(dto),
        );
      }
    });
  }

  async changeTariffStatus(id: number, dto: UpdateTariffDto): Promise<Tariff> {
    const tariff = await this.dbService.tariff.findFirst({ where: { id: id } });

    if (!tariff) {
      throw new NotFoundException(`Запись с id ${id} не найдена`);
    }

    const activeTariffs = await this.dbService.tariff.findMany({
      where: {
        status: 'ACTIVE',
      },
      orderBy: { orderInList: 'desc' },
    });

    const updatedTariff = await this.dbService.tariff
      .update({
        where: { id: id },
        data: {
          status: dto.status,
          orderInList: dto.status === 'ARCHIVE' ? 0 : activeTariffs.length + 1,
        },
      })
      .catch((err) => {
        this.logger.error(err);
        throw new BadRequestException(
          'Не удалось поменять статус у тарифа с данными: ' +
            JSON.stringify(dto),
        );
      });

    if (updatedTariff.status === 'ARCHIVE') {
      await this.updateTariffsOrderAfterChangeStatus();
    }

    return updatedTariff;
  }

  private async updateTariffsOrderAfterChangeStatus() {
    const activeTariffs = await this.dbService.tariff.findMany({
      where: {
        status: 'ACTIVE',
      },
      orderBy: { orderInList: 'desc' },
    });

    await this.dbService.$transaction(async () => {
      try {
        for (let i = 0; i < activeTariffs.length; i++) {
          await this.dbService.tariff.update({
            where: { id: activeTariffs[i].id },
            data: {
              orderInList: activeTariffs.length - i,
            },
          });
        }
      } catch (error) {
        this.logger.error(error);

        throw new BadRequestException(
          'Не удалось поменять позиции элементов после свича статуса: ' +
            JSON.stringify(activeTariffs),
        );
      }
    });
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
