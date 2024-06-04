import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';
import { DbService } from 'src/db/db.service';

@Injectable()
export class CityService {
  private readonly logger = new Logger(CityService.name);

  constructor(private readonly dbService: DbService) {}

  async create(createCityDto: CreateCityDto) {
    const city = await this.dbService.city
      .create({ data: createCityDto })
      .catch((err) => {
        this.logger.error('Не удалось создать город');
        this.logger.error(err);
      });

    if (!city) {
      throw new BadRequestException('Не удалось создать город');
    }

    return city;
  }

  async findAll() {
    return await this.dbService.city.findMany();
  }

  async findAllWhereIncludesFranchise() {
    const franchises = await this.dbService.city
      .findMany({
        where: {
          franchise: {
            isNot: null,
          },
        },
      })
      .catch((err) => {
        this.logger.error('Не удалось получить города c франшизой');
        this.logger.error(err);
        throw new BadRequestException('Не удалось получить города c франшизой');
      });

    return franchises;
  }

  async findAllWhereFranchiseEmpty() {
    const franchises = await this.dbService.city
      .findMany({
        where: {
          franchise: null,
        },
      })
      .catch((err) => {
        this.logger.error('Не удалось получить города без франшизы');
        this.logger.error(err);
        throw new BadRequestException(
          'Не удалось получить города без франшизы',
        );
      });

    return franchises;
  }

  async findOne(id: number) {
    const city = await this.dbService.city.findFirst({ where: { id: id } });
    if (!city) {
      throw new BadRequestException(`Города с id: ${id} не существует`);
    }
    return city;
  }

  async update(id: number, updateCityDto: UpdateCityDto) {
    await this.findOne(id);
    const updatedCity = await this.dbService.city
      .update({
        where: { id: id },
        data: updateCityDto,
      })
      .catch((err) => {
        this.logger.error('Не удалось обновить город', err);
        this.logger.error(err);
      });

    if (!updatedCity) {
      throw new BadRequestException(`Не удалось обновить город с id: ${id}`);
    }

    return updatedCity;
  }

  async remove(id: number) {
    await this.findOne(id);
    return await this.dbService.city
      .delete({ where: { id: id } })
      .catch((err) => {
        this.logger.error('Не удалось удалить город');
        this.logger.error(err);
        throw new BadRequestException(`Не удалось удалить город с id: ${id}`);
      });
  }
}
