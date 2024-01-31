import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreatePromocodeDto } from './dto/create-promocode.dto';
import { UpdatePromocodeDto } from './dto/update-promocode.dto';
import { DbService } from 'src/db/db.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class PromocodeService {
  private logger = new Logger();

  constructor(private readonly dbService: DbService) {}

  async create(createPromocodeDto: CreatePromocodeDto) {
    return this.dbService.promocode
      .create({ data: createPromocodeDto })
      .catch((err) => {
        this.logger.error(err);
        return null;
      });
  }

  async findAll() {
    return this.dbService.promocode.findMany({
      orderBy: { addedDate: 'desc' },
    });
  }

  async findOne(id: number) {
    const promo = await this.dbService.promocode.findFirst({
      where: { id: id },
    });
    if (!promo) {
      throw new NotFoundException(`Запись с id ${id} не найдена`);
    }
    return promo;
  }

  async update(id: number, updatePromocodeDto: UpdatePromocodeDto) {
    const promo = await this.dbService.promocode.findFirst({
      where: { id: id },
    });

    if (!promo) {
      throw new NotFoundException(`Запись с id ${id} не найдена`);
    }

    return this.dbService.promocode
      .update({ where: { id: id }, data: updatePromocodeDto })
      .catch((err) => {
        this.logger.error(err);
        return null;
      });
  }

  async remove(id: number) {
    const promo = await this.dbService.promocode.findFirst({
      where: { id: id },
    });
    if (!promo) {
      throw new NotFoundException(
        `Не получается удалить. Записи с id ${id} не существует!`,
      );
    }
    return this.dbService.promocode
      .delete({ where: { id: id } })
      .catch((err) => {
        this.logger.error(err);
        return null;
      });
  }

  @Cron(CronExpression.EVERY_12_HOURS)
  async checkPromoExp() {
    const promocodes = await this.dbService.promocode.findMany({
      where: {
        dateEnd: {
          lt: new Date(),
        },
        status: 'ACTIVE',
      },
    });

    if (promocodes.length === 0) {
      return;
    }

    promocodes.forEach(async (promocode) => {
      await this.dbService.promocode.update({
        where: { id: promocode.id },
        data: {
          status: 'ARCHIVE',
        },
      });

      this.logger.log(`Промокод ${promocode.code} истек`);
    });
  }
}
