import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateScooterDto } from './dto/create-scooter.dto';
import { UpdateScooterDto } from './dto/update-scooter.dto';
import { DbService } from 'src/db/db.service';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import { Scooter } from '@prisma/client';

@Injectable()
export class ScooterService {
  private readonly logger = new Logger();

  constructor(private readonly dbService: DbService) {}

  async create(createScooterDto: CreateScooterDto) {
    const deviceId = this.generateDeviceId();

    const path = `uploads/images/scooters/${deviceId}/save/image.png`;
    if (createScooterDto.photo) {
      this.saveFile(createScooterDto.photo, path);
    }

    const qrPath = await this.qrQenerator(deviceId);

    return this.dbService.scooter
      .create({
        data: {
          batteryLevel: createScooterDto.batteryLevel,
          deviceId: deviceId,
          modelName: createScooterDto.modelName,
          qrCode: qrPath,
          serialNumber: createScooterDto.serialNumber,
          active: createScooterDto.active,
          addedDate: createScooterDto.addedDate,
          franchiseId: createScooterDto.franchiseId,
          parkingId: createScooterDto.parkingId,
          status: createScooterDto.status,
          photo: createScooterDto.photo ? path : null,
        },
      })
      .catch((err) => {
        this.logger.error(err);
        return null;
      });
  }

  async findAll() {
    return this.dbService.scooter.findMany();
  }

  async findOne(id: number) {
    return this.dbService.scooter
      .findFirst({ where: { id: id } })
      .catch((err) => {
        this.logger.error(err);
        return null;
      });
  }

  async update(id: number, updateScooterDto: UpdateScooterDto) {
    return this.dbService.scooter
      .update({ where: { id: id }, data: updateScooterDto })
      .catch((err) => {
        this.logger.error(err);
        return null;
      });
  }

  async remove(id: number) {
    const scooter = await this.dbService.scooter.findFirst({
      where: { id: id },
    });
    if (!scooter) {
      throw new NotFoundException('Такой записи не существует');
    }

    const deletedItem: Scooter = await this.dbService.scooter.delete({
      where: { id: id },
    });

    fs.rmSync(`uploads/images/scooters/${deletedItem.deviceId}`, {
      recursive: true,
    });

    return deletedItem;
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

  private async qrQenerator(deviceId: string) {
    const { data } = await axios.get(
      `https://api.qrserver.com/v1/create-qr-code/?size=76x76&data=${deviceId}`,
      { responseType: 'arraybuffer' },
    );

    const filePath = `uploads/images/scooters/${deviceId}/qr/qr-code.png`;

    const directoryPath = path.dirname(filePath);
    if (!fs.existsSync(directoryPath)) {
      fs.mkdirSync(directoryPath, { recursive: true });
    }

    fs.writeFileSync(filePath, data);
    return filePath;
  }

  private generateDeviceId(): string {
    const randomNumber = Math.floor(100000 + Math.random() * 900000);
    const formattedNumber = String(randomNumber).replace(
      /(\d{3})(\d{3})/,
      '$1-$2',
    );

    return formattedNumber;
  }
}