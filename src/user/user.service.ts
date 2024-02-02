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
    const uuid = generateUUID();

    return this.dbService.user
      .create({
        data: {
          clientId: uuid,
          phone: createUserDto.phone,
          name: createUserDto.name,
          email: createUserDto.email,
          status: createUserDto.status,
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
      },
    });
  }

  async findOne(id: number) {
    const user = await this.dbService.user.findFirst({ where: { id: id } });
    if (!user) {
      throw new NotFoundException(`Пользователь с id ${id} не найден`);
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
