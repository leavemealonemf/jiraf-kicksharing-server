import { Injectable } from '@nestjs/common';
import { CreateErpUserDto } from './dto/create-erp-user.dto';
import { UpdateErpUserDto } from './dto/update-erp-user.dto';
import { DbService } from 'src/db/db.service';
import { genSaltSync, hashSync } from 'bcrypt';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class ErpUserService {
  constructor(
    private readonly dbService: DbService,
    private readonly mailService: MailService,
  ) {}

  async create(createErpUserDto: CreateErpUserDto) {
    const hashedPassword = this.hashPassword(createErpUserDto.password);

    // await this.mailService.sendUserConfirmation(createErpUserDto);

    return this.dbService.erpUser.create({
      data: {
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
