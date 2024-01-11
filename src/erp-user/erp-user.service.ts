import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateErpUserDto } from './dto/create-erp-user.dto';
import { UpdateErpUserDto } from './dto/update-erp-user.dto';
import { DbService } from 'src/db/db.service';
import { genSaltSync, hashSync } from 'bcrypt';

@Injectable()
export class ErpUserService {
  constructor(private readonly dbService: DbService) {}

  async create(createErpUserDto: CreateErpUserDto) {
    const findedUser = await this.dbService.erpUser.findFirst({
      where: { email: createErpUserDto.email },
    });

    if (findedUser) {
      throw new ForbiddenException(
        'Пользователь с таким email уже зарегистрирован',
      );
    }

    const hashedPassword = this.hashPassword(createErpUserDto.password);

    return this.dbService.erpUser.create({
      data: {
        email: createErpUserDto.email,
        name: createErpUserDto.name,
        phone: createErpUserDto.phone,
        password: hashedPassword,
        franchiseId: createErpUserDto.franchiseId,
      },
    });
  }

  async findAll() {
    return this.dbService.erpUser.findMany();
  }

  async findById(id: number) {
    return await this.dbService.erpUser.findFirst({ where: { id: id } });
  }

  async findByEmail(email: string) {
    return await this.dbService.erpUser.findFirst({ where: { email: email } });
  }

  update(id: number, updateErpUserDto: UpdateErpUserDto) {
    return this.dbService.erpUser.update({
      where: { id },
      data: updateErpUserDto,
    });
  }

  async remove(id: number) {
    return this.dbService.erpUser.delete({ where: { id: id } });
  }

  private hashPassword(password: string) {
    return hashSync(password, genSaltSync(10));
  }
}
