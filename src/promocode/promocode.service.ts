import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreatePromocodeDto } from './dto/create-promocode.dto';
import { UpdatePromocodeDto } from './dto/update-promocode.dto';
import { DbService } from 'src/db/db.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PromocodeStatus } from '@prisma/client';

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

  async findAll(status?: PromocodeStatus) {
    if (!status) {
      return this.dbService.promocode.findMany({
        include: {
          usedByUsers: true,
        },
        orderBy: { addedDate: 'desc' },
      });
    }
    return this.dbService.promocode.findMany({
      where: { status: status },
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

  async findOneByCode(code: string) {
    const promo = await this.dbService.promocode.findFirst({
      where: { code: code },
      include: { usedByUsers: true },
    });
    if (!promo) {
      throw new NotFoundException(`Промокода ${code} не существует`);
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

  async usePromocode(userId: string, code: string) {
    const promocode = await this.findOneByCode(code);
    if (promocode.status === 'ARCHIVE') {
      throw new ForbiddenException(`Промокод ${code} истек`);
    }

    const isPromocodeUsed = promocode.usedByUsers.some(
      (user) => user.clientId === userId,
    );

    if (isPromocodeUsed) {
      throw new ForbiddenException(`Вы уже использовали промокод ${code}`);
    }

    return this.dbService.promocode.update({
      where: { id: promocode.id },
      data: {
        usedByUsers: {
          connect: {
            clientId: userId,
          },
          update: {
            where: { clientId: userId },
            data: {
              balance: {
                increment: Number(promocode.sum),
              },
            },
          },
        },
      },
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
