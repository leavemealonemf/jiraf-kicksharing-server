import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateErpUserDto } from './dto/create-erp-user.dto';
import { UpdateErpUserDto } from './dto/update-erp-user.dto';
import { DbService } from 'src/db/db.service';
import { genSaltSync, hashSync } from 'bcrypt';
import { ErpUser } from '@prisma/client';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { generateUUID } from '@common/utils';

@Injectable()
export class ErpUserService {
  logger = new Logger();

  constructor(private readonly dbService: DbService) {}

  async create(createErpUserDto: CreateErpUserDto) {
    const hashedPassword = this.hashPassword(createErpUserDto.password);
    const uuid = generateUUID();

    return this.dbService.erpUser.create({
      data: {
        uuid: uuid,
        email: createErpUserDto.email,
        name: createErpUserDto.name,
        phone: createErpUserDto.phone,
        password: hashedPassword,
        role: createErpUserDto.role,
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
    return await this.dbService.erpUser
      .findFirst({ where: { email: email } })
      .catch((err) => {
        this.logger.error(err);
        return null;
      });
  }

  async update(id: number, updateErpUserDto: UpdateErpUserDto) {
    const user = await this.dbService.erpUser.findFirst({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(
        `Не удалось обновить. Пользователя с id ${id} не существует`,
      );
    }

    const path = `uploads/images/erp-user/${
      user.uuid
    }/photo/avatar${Math.random()}.png`;

    if (updateErpUserDto.avatar) {
      this.saveFile(updateErpUserDto.avatar, path);
    }

    return this.dbService.erpUser.update({
      where: { id },
      data: {
        avatar: path,
        email: updateErpUserDto.email,
        franchiseId: updateErpUserDto.franchiseId,
        name: updateErpUserDto.name,
        password: updateErpUserDto.password,
        phone: updateErpUserDto.phone,
        role: updateErpUserDto.role,
      },
    });
  }

  async remove(id: number, decUser: ErpUser) {
    console.log(decUser);
    if (decUser.role !== 'ADMIN') {
      throw new ForbiddenException('У вас недостаточно прав!');
    }

    const user = await this.dbService.erpUser.findFirst({ where: { id: id } });

    if (!user) {
      throw new NotFoundException('Такого пользователя не существует');
    }

    return this.dbService.erpUser.delete({ where: { id: id } });
  }

  hashPassword(password: string) {
    return hashSync(password, genSaltSync(10));
  }

  async generateResetToken(user: ErpUser) {
    const token = crypto.randomBytes(32).toString('hex');
    const expTime = new Date();
    expTime.setHours(expTime.getHours() + 1);

    const isTokenExist = await this.dbService.forgotPasswordModel.findFirst({
      where: { userId: user.id },
    });

    if (isTokenExist && isTokenExist.expiredTime > new Date()) {
      const { token: alreadyToken } = isTokenExist;
      return alreadyToken;
    }

    const deleteExpiredToken = await this.dbService.forgotPasswordModel.delete({
      where: { id: isTokenExist.id },
    });

    if (!deleteExpiredToken) {
      throw new ForbiddenException('Не удалось удалить просроченный токен');
    }

    const generateToken = await this.dbService.forgotPasswordModel.create({
      data: {
        token: token,
        userId: user.id,
        expiredTime: expTime,
      },
    });

    if (!generateToken) {
      throw new ForbiddenException(
        'Не удалось сгенерировать токен восстановления пароля',
      );
    }

    const { token: newToken } = generateToken;
    return newToken;
  }

  private saveFile(photo: string, entityPath: string) {
    const base64String = photo;
    const matches = base64String.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    const filePath = entityPath;

    const directoryPath = path.dirname(filePath);
    if (!fs.existsSync(directoryPath)) {
      fs.mkdirSync(directoryPath, { recursive: true });
    }

    fs.writeFileSync(filePath, buffer);
  }
}
