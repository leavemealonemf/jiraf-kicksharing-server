import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { DbService } from 'src/db/db.service';
import { generateUUID } from '@common/utils';

@Injectable()
export class SubscriptionService {
  private readonly logger = new Logger();

  constructor(private readonly dbService: DbService) {}

  async create(dto: CreateSubscriptionDto) {
    const uuid = generateUUID();

    return this.dbService.subscription
      .create({
        data: {
          name: dto.name,
          price: dto.price,
          uuid: uuid,
          days: dto.days,
        },
      })
      .catch((err) => {
        this.logger.error(err);
        return null;
      });
  }

  async findAll() {
    return this.dbService.subscription.findMany({
      orderBy: { dateTimeCreated: 'desc' },
    });
  }

  async findOne(id: number) {
    const subscription = await this.dbService.subscription.findFirst({
      where: { id: id },
    });
    if (!subscription) {
      throw new NotFoundException(`Запись с id ${id} не найдена`);
    }
    return subscription;
  }

  async update(id: number, dto: UpdateSubscriptionDto) {
    const subscription = await this.dbService.subscription.findFirst({
      where: { id: id },
    });

    if (!subscription) {
      throw new NotFoundException(`Запись с id ${id} не найдена`);
    }

    return this.dbService.subscription
      .update({ where: { id: id }, data: dto })
      .catch((err) => {
        this.logger.error(err);
        return null;
      });
  }

  async remove(id: number) {
    const subscription = await this.dbService.subscription.findFirst({
      where: { id: id },
    });
    if (!subscription) {
      throw new NotFoundException(
        `Не получается удалить. Записи с id ${id} не существует!`,
      );
    }
    return this.dbService.subscription
      .delete({ where: { id: id } })
      .catch((err) => {
        this.logger.error(err);
        return null;
      });
  }
}
