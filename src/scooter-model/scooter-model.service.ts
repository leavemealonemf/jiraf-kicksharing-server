import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateScooterModelDto } from './dto/create-scooter-model.dto';
import { UpdateScooterModelDto } from './dto/update-scooter-model.dto';
import { DbService } from 'src/db/db.service';

@Injectable()
export class ScooterModelService {
  private readonly logger = new Logger();

  constructor(private readonly dbService: DbService) {}

  async create(createScooterModelDto: CreateScooterModelDto) {
    return this.dbService.scooterModel
      .create({ data: createScooterModelDto })
      .catch((err) => {
        this.logger.error(err);
        return null;
      });
  }

  async findAll() {
    const models = await this.dbService.scooterModel.findMany();
    const sortedModels = models.sort((a, b) => a.id - b.id);
    return sortedModels;
  }

  async findOne(id: number) {
    return this.dbService.scooterModel.findFirst({ where: { id: id } });
  }

  async update(id: number, updateScooterModelDto: UpdateScooterModelDto) {
    return this.dbService.scooterModel
      .update({ where: { id: id }, data: updateScooterModelDto })
      .catch((err) => {
        this.logger.error(err);
        return null;
      });
  }

  async remove(id: number) {
    const scooterModel = await this.dbService.scooterModel.findFirst({
      where: { id: id },
    });
    if (!scooterModel) {
      throw new NotFoundException('Такой записи не существует');
    }

    return this.dbService.scooterModel.delete({
      where: { id: id },
    });
  }
}
