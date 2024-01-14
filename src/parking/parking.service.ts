import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateParkingDto } from './dto/create-parking.dto';
import { UpdateParkingDto } from './dto/update-parking.dto';
import { DbService } from 'src/db/db.service';

@Injectable()
export class ParkingService {
  private readonly logger = new Logger();

  constructor(private readonly dbService: DbService) {}

  async create(createParkingDto: CreateParkingDto) {
    return this.dbService.parking
      .create({ data: createParkingDto })
      .catch((err) => {
        this.logger.error(err);
        return null;
      });
  }

  async findAll() {
    return this.dbService.parking.findMany();
  }

  async findOne(id: number) {
    return this.dbService.parking.findFirst({ where: { id: id } });
  }

  async update(id: number, updateParkingDto: UpdateParkingDto) {
    return this.dbService.parking.update({
      where: { id: id },
      data: updateParkingDto,
    });
  }

  async remove(id: number) {
    const parking = await this.dbService.parking.findFirst({
      where: { id: id },
    });
    if (!parking) {
      throw new NotFoundException('Такой записи не существует');
    }
    return this.dbService.parking.delete({
      where: { id: id },
    });
  }
}
