import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { DbService } from 'src/db/db.service';

@Injectable()
export class TripService {
  private readonly logger = new Logger();

  constructor(private readonly dbService: DbService) {}

  async create(createTripDto: CreateTripDto) {
    return this.dbService.trip
      .create({
        data: {
          endTime: createTripDto.endTime,
          photo: createTripDto.photo,
          price: createTripDto.price,
          startTime: createTripDto.startTime,
          travelTime: createTripDto.travelTime,
          scooterId: createTripDto.scooterId,
          tariffId: createTripDto.tariffId,
          userId: createTripDto.userId,
        },
      })
      .catch((err) => {
        this.logger.error(err);
        return null;
      });
  }

  async findAll() {
    return this.dbService.trip.findMany({
      include: { scooter: true, tariff: true, user: true },
    });
  }

  async findOne(id: number) {
    const trip = await this.dbService.trip.findFirst({ where: { id: id } });
    if (!trip) {
      throw new NotFoundException(`Запись с id ${id} не найдена`);
    }
    return trip;
  }

  async update(id: number, updateTripDto: UpdateTripDto) {
    const trip = await this.dbService.trip.findFirst({ where: { id: id } });

    if (!trip) {
      throw new NotFoundException(`Запись с id ${id} не найдена`);
    }

    return this.dbService.trip
      .update({ where: { id: id }, data: updateTripDto })
      .catch((err) => {
        this.logger.error(err);
        return null;
      });
  }

  async remove(id: number) {
    const trip = await this.dbService.trip.findFirst({ where: { id: id } });
    if (!trip) {
      throw new NotFoundException(
        `Не получается удалить. Записи с id ${id} не существует!`,
      );
    }
    return this.dbService.trip.delete({ where: { id: id } }).catch((err) => {
      this.logger.error(err);
      return null;
    });
  }
}
