import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateErpUserDto } from './dto/create-erp-user.dto';
import { UpdateErpUserDto } from './dto/update-erp-user.dto';
import { DbService } from 'src/db/db.service';
import { genSaltSync, hashSync } from 'bcrypt';
import { $Enums, ErpUser } from '@prisma/client';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { generateUUID } from '@common/utils';
import * as generator from 'generate-password';
import { MailService } from 'src/mail/mail.service';
import { CanLeaveUserPermissionFabric } from './fabrics/can-leave-user-permission.fabric';

@Injectable()
export class ErpUserService {
  private readonly logger = new Logger(ErpUserService.name);

  constructor(
    private readonly dbService: DbService,
    private readonly mailService: MailService,
    private readonly canLeaveFabric: CanLeaveUserPermissionFabric,
  ) {}

  async createBaseUser() {
    const hashedPassword = this.hashPassword('qwerty123BET');
    const uuid = generateUUID();

    const data = {
      name: 'Jack',
      phone: '+79202475351',
      email: 'vano@ya.ru',
      password: hashedPassword,
      role: $Enums.ErpUserRoles.ADMIN,
      uuid: uuid,
    };

    return this.dbService.erpUser.create({
      data: {
        email: data.email,
        name: data.name,
        password: data.password,
        phone: data.phone,
        role: data.role,
      },
    });
  }

  async create(createErpUserDto: CreateErpUserDto) {
    const password = this.generatePassword();

    const hashedPassword = this.hashPassword(password);
    const uuid = generateUUID();

    await this.mailService.sendUserConfirmation(createErpUserDto, password);

    if (createErpUserDto.connectToFranchiseId) {
      return await this.connectUserToFranchiseAsEmployee(
        createErpUserDto,
        hashedPassword,
        uuid,
      );
    }

    return this.dbService.erpUser.create({
      data: {
        uuid: uuid,
        email: createErpUserDto.email,
        name: createErpUserDto.name,
        phone: createErpUserDto.phone,
        password: hashedPassword,
        role: createErpUserDto.role,
        inviterId: createErpUserDto.inviterId,
      },
      include: { inviter: true },
    });
  }

  async findAll(userId: number) {
    const user = await this.findById(userId);

    if (user.franchiseEmployeeId) {
      return await this.dbService.erpUser.findMany({
        where: {
          franchiseEmployeeId: user.franchiseEmployeeId,
        },
        orderBy: { dateTimeCreated: 'desc' },
        include: {
          inviter: true,
          franchise: {
            select: {
              id: true,
              organization: true,
            },
          },
          franchiseEmployee: {
            select: {
              id: true,
              organization: true,
            },
          },
        },
      });
    }

    return await this.dbService.erpUser.findMany({
      orderBy: { dateTimeCreated: 'desc' },
      include: {
        inviter: true,
        franchise: {
          select: {
            id: true,
            organization: true,
          },
        },
        franchiseEmployee: {
          select: {
            id: true,
            organization: true,
          },
        },
      },
    });
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

    return await this.dbService.erpUser
      .update({
        where: { id },
        data: {
          avatar: updateErpUserDto.avatar ? path : user.avatar,
          email: updateErpUserDto.email,
          name: updateErpUserDto.name,
          password: this.hashPassword(updateErpUserDto.password),
          phone: updateErpUserDto.phone,
          role: updateErpUserDto.role,
          status: updateErpUserDto.status,
        },
        include: {
          inviter: true,
          franchise: {
            select: {
              id: true,
              organization: true,
            },
          },
          franchiseEmployee: {
            select: {
              id: true,
              organization: true,
            },
          },
        },
      })
      .catch((err) => {
        const errResponse = JSON.stringify(updateErpUserDto);
        this.logger.error(
          `Не удалось обновить erp-пользователя с данными: ${errResponse}`,
        );
        throw new BadRequestException(
          `Не удалось обновить erp-пользователя с данными: ${errResponse}`,
        );
      });
  }

  async remove(id: number, decUser: ErpUser) {
    if (decUser.role !== 'ADMIN') {
      throw new ForbiddenException('У вас недостаточно прав!');
    }

    const user = await this.dbService.erpUser.findFirst({ where: { id: id } });

    if (!user) {
      throw new NotFoundException('Такого пользователя не существует');
    }

    return this.dbService.erpUser.delete({ where: { id: id } });
  }

  async leaveUser(user: ErpUser, leaveUserId: number) {
    const userToLeave = await this.findById(leaveUserId);
    const canLeave = this.canLeaveFabric.canLeave(user.role, userToLeave.role);
    if (!canLeave) throw new BadRequestException('У вас недостаточно прав');
    const isDeleted = await this.dbService.erpUser
      .delete({
        where: { id: userToLeave.id },
      })
      .catch((err) => {
        this.logger.error(err);
        throw new BadRequestException(
          `Не удалось удалить пользователя с id ${leaveUserId}`,
        );
      });

    if (isDeleted) {
      return {
        id: isDeleted.id,
        deleted: true,
      };
    } else {
      return {
        id: isDeleted.id,
        deleted: false,
      };
    }
  }

  private async connectUserToFranchiseAsEmployee(
    dto: CreateErpUserDto,
    hashedPassword: string,
    uuid: string,
  ) {
    if (dto.connectToFranchiseId && dto.role !== 'FRANCHISE') {
      return await this.dbService.erpUser
        .create({
          data: {
            uuid: uuid,
            email: dto.email,
            name: dto.name,
            phone: dto.phone,
            password: hashedPassword,
            role: dto.role,
            inviterId: dto.inviterId,
            franchiseEmployeeId: dto.connectToFranchiseId,
          },
          include: {
            inviter: true,
            franchise: {
              select: {
                id: true,
                organization: true,
              },
            },
            franchiseEmployee: {
              select: {
                id: true,
                organization: true,
              },
            },
          },
        })
        .catch((err) => {
          this.logger.error(err);
          this.logger.error(
            'Не удалось создать и связать пользователя с франшизой (работник)',
          );
          throw new BadRequestException(
            'Не удалось создать и связать пользователя с франшизой (работник)',
          );
        });
    }

    if (dto.connectToFranchiseId && dto.role === 'FRANCHISE') {
      return await this.dbService.erpUser
        .create({
          data: {
            uuid: uuid,
            email: dto.email,
            name: dto.name,
            phone: dto.phone,
            password: hashedPassword,
            role: dto.role,
            inviterId: dto.inviterId,
            franchise: {
              connect: {
                id: dto.connectToFranchiseId,
              },
            },
            franchiseEmployeeId: dto.connectToFranchiseId,
          },
          include: {
            inviter: true,
            franchise: {
              select: {
                id: true,
                organization: true,
              },
            },
            franchiseEmployee: {
              select: {
                id: true,
                organization: true,
              },
            },
          },
        })
        .catch((err) => {
          this.logger.error(err);
          this.logger.error(
            'Не удалось создать и связать пользователя с франшизой (руководитель)',
          );
          throw new BadRequestException(
            'Не удалось создать и связать пользователя с франшизой (руководитель)',
          );
        });
    }
  }

  hashPassword(password: string) {
    if (!password) return;

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

    if (isTokenExist && isTokenExist.expiredTime < new Date()) {
      const deleteExpiredToken =
        await this.dbService.forgotPasswordModel.delete({
          where: { id: isTokenExist.id },
        });

      if (!deleteExpiredToken) {
        throw new ForbiddenException('Не удалось удалить просроченный токен');
      }
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

    const filesInDirectory = fs.readdirSync(directoryPath);

    if (filesInDirectory.length > 0) {
      const fileToDelete = path.join(directoryPath, filesInDirectory[0]);
      fs.unlinkSync(fileToDelete);
    }

    fs.writeFileSync(filePath, buffer);
  }

  private generatePassword() {
    const password = generator.generate({
      length: 10,
      numbers: true,
      uppercase: true,
    });

    return password;
  }
}
