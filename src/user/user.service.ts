import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DbService } from 'src/db/db.service';
import { generateUUID } from '@common/utils';

@Injectable()
export class UserService {
  private readonly logger = new Logger();

  constructor(private readonly dbService: DbService) {}

  async create(createUserDto: CreateUserDto) {
    const user = await this.dbService.user.findFirst({
      where: { phone: createUserDto.phone },
    });

    if (user) {
      return user;
    }

    const uuid = generateUUID();

    return this.dbService.user
      .create({
        data: {
          clientId: uuid,
          phone: createUserDto.phone,
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
    const user = await this.dbService.user.findFirst({
      where: { id: id },
      include: {
        paymentMethods: true,
        payments: {
          include: { paymentMethod: true },
        },
      },
    });
    if (!user) {
      throw new NotFoundException(`Пользователь с id ${id} не найден`);
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

    return this.dbService.user
      .update({ where: { id: id }, data: updateUserDto })
      .catch((err) => {
        this.logger.error(err);
        return null;
      });
  }

  async remove(id: number) {
    const user = await this.dbService.user.findFirst({ where: { id: id } });
    if (!user) {
      throw new NotFoundException(
        `Не получается удалить. Пользователя с id ${id} не существует!`,
      );
    }
    return this.dbService.user.delete({ where: { id: id } }).catch((err) => {
      this.logger.error(err);
      return null;
    });
  }
}
