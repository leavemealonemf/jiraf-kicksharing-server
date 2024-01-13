import { Injectable, Logger } from '@nestjs/common';
import { CreateFranchiseDto } from './dto/create-franchise.dto';
import { UpdateFranchiseDto } from './dto/update-franchise.dto';
import { DbService } from 'src/db/db.service';
import { ErpUser } from '@prisma/client';

@Injectable()
export class FranchiseService {
  private readonly logger = new Logger();

  constructor(private readonly dbService: DbService) {}

  async createFirstTime(user: ErpUser) {
    const franchise = await this.dbService.franchise.create({
      data: {
        erpUserId: user.id,
      },
    });

    return franchise;
  }

  async create(dto: CreateFranchiseDto) {
    return this.dbService.franchise.create({ data: dto }).catch((err) => {
      this.logger.error(err);
      return null;
    });
  }

  async findAll() {
    return this.dbService.franchise.findMany();
  }

  async findOne(id: number) {
    return this.dbService.franchise.findFirst({ where: { id: id } });
  }

  async update(id: number, updateFranchiseDto: UpdateFranchiseDto) {
    return this.dbService.franchise.update({
      where: { id: id },
      data: updateFranchiseDto,
    });
  }

  async remove(id: number) {
    return this.dbService.franchise.delete({ where: { id: id } });
  }
}
