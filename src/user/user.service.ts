import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { DbService } from 'src/db/db.service';
import { generateUUID } from '@common/utils';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(private readonly dbService: DbService) {}

  async create(phone: string) {
    const user = await this.dbService.user.findFirst({
      where: { phone: phone },
    });

    if (user) {
      return user;
    }

    const uuid = generateUUID();

    return this.dbService.user
      .create({
        data: {
          clientId: uuid,
          phone: phone,
        },
      })
      .catch((err) => {
        this.logger.error(err);
        return null;
      });
  }

  async findAll() {
    return this.dbService.user.findMany({
      include: {
        trips: {
          include: {
            scooter: true,
            tariff: true,
          },
        },
        paymentMethods: true,
      },
    });
  }

  async findOne(id: number) {
    const user = await this.dbService.user
      .findFirst({
        where: { id: id },
        include: {
          paymentMethods: true,
          payments: {
            include: { paymentMethod: true },
          },
        },
      })
      .catch((err) => {
        this.logger.error(err);
      });
    if (!user) {
      throw new NotFoundException(`Пользователь с id ${id} не найден`);
    }
    return user;
  }

  async findOneByUUID(uuid: string) {
    const user = await this.dbService.user.findFirst({
      where: { clientId: uuid },
      include: {
        paymentMethods: true,
        fines: {
          orderBy: { createdAt: 'desc' },
          include: {
            initiator: {
              select: {
                id: true,
                organization: true,
                supportLink: true,
                city: {
                  select: {
                    name: true,
                  },
                },
              },
            },
            trip: {
              select: {
                startTime: true,
                endTime: true,
                scooter: {
                  select: {
                    deviceId: true,
                  },
                },
              },
            },
          },
        },
        depts: {
          orderBy: { createdAt: 'desc' },
          include: {
            initiator: {
              select: {
                organization: true,
                supportLink: true,
                city: {
                  select: {
                    name: true,
                  },
                },
              },
            },
            trip: {
              select: {
                id: true,
              },
            },
          },
        },
        subscriptionsOptions: true,
      },
    });
    if (!user) {
      throw new NotFoundException(`Пользователь с id ${uuid} не найден`);
    }
    return user;
  }

  async findOneByPhone(phone: string) {
    const user = await this.dbService.user.findFirst({
      where: { phone: phone },
    });
    if (!user) {
      throw new NotFoundException(`Пользователь с phone ${phone} не найден`);
    }
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.dbService.user.findFirst({ where: { id: id } });

    if (!user) {
      throw new NotFoundException(`Пользователь с id ${id} не найден`);
    }

    if (updateUserDto.email) {
      const isEmailExist = await this.dbService.user.findFirst({
        where: { email: updateUserDto.email },
      });
      if (isEmailExist) {
        throw new ForbiddenException('Данный email уже занят');
      }
    }

    return this.dbService.user
      .update({ where: { id: id }, data: updateUserDto })
      .catch((err) => {
        this.logger.error(err);
        return null;
      });
  }

  async deleteUserAccount(userId: number) {
    const user = await this.dbService.user
      .findFirst({ where: { id: userId } })
      .catch((err) => {
        this.logger.error(err);
      });
    if (!user) {
      throw new NotFoundException(
        `Не получается удалить. Пользователя с id ${userId} не существует!`,
      );
    }

    if (userId !== user.id) {
      throw new BadRequestException('Невозможно удалить аккаунт');
    }

    const updated = await this.dbService.$transaction(async () => {
      const updated = await this.dbService.user
        .update({
          where: { id: userId },
          data: {
            status: 'DELETED',
            phone: user.phone + ':deleted/' + new Date().toISOString(),
          },
        })
        .catch((err) => {
          this.logger.error(err);
        });

      // DELETE USER SUBSCRIPTION OPTIONS IF EXIST

      const userSubscriptionOptions =
        await this.dbService.userSubscriptionsOptions.findFirst({
          where: { userId: user.id },
        });

      if (userSubscriptionOptions) {
        await this.dbService.userSubscriptionsOptions
          .delete({
            where: { userId: user.id },
          })
          .catch((err) => {
            this.logger.error(err);
          });
      }

      return updated;
    });

    if (!updated) {
      throw new BadRequestException('Не удалось удалить аккаунт');
    }

    return {
      message: 'success',
    };
  }

  async remove(id: number) {
    const user = await this.dbService.user.findFirst({ where: { id: id } });
    if (!user) {
      throw new NotFoundException(
        `Не получается удалить. Пользователя с id ${id} не существует!`,
      );
    }

    if (id !== user.id) {
      throw new BadRequestException('Невозможно удалить аккаунт');
    }

    return this.dbService.user.delete({ where: { id: id } }).catch((err) => {
      this.logger.error(err);
      return null;
    });
  }
}
