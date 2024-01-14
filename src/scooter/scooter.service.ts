import { Injectable } from '@nestjs/common';
import { CreateScooterDto } from './dto/create-scooter.dto';
import { UpdateScooterDto } from './dto/update-scooter.dto';

@Injectable()
export class ScooterService {
  create(createScooterDto: CreateScooterDto) {
    return 'This action adds a new scooter';
  }

  findAll() {
    return `This action returns all scooter`;
  }

  findOne(id: number) {
    return `This action returns a #${id} scooter`;
  }

  update(id: number, updateScooterDto: UpdateScooterDto) {
    return `This action updates a #${id} scooter`;
  }

  remove(id: number) {
    return `This action removes a #${id} scooter`;
  }
}
