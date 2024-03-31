import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateScooterDto } from './dto/create-scooter.dto';
import { UpdateScooterDto } from './dto/update-scooter.dto';
import { DbService } from 'src/db/db.service';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import { Scooter } from '@prisma/client';
import { RightechScooterService } from 'src/rightech-scooter/rightech-scooter.service';
import { SettingsService } from 'src/settings/settings.service';

@Injectable()
export class ScooterService {
  private readonly logger = new Logger();

  constructor(
    private readonly dbService: DbService,
    private readonly rightechScooterService: RightechScooterService,
    private readonly settingsService: SettingsService,
  ) {}

  async create(createScooterDto: CreateScooterDto) {
    const deviceId = this.generateDeviceId();

    const res = await this.rightechScooterService.create(deviceId);

    if (!res) {
      throw new ConflictException('Не удалось создать самокат');
    }

    const path = `uploads/images/scooters/${deviceId}/save/image.png`;
    if (createScooterDto.photo) {
      this.saveFile(createScooterDto.photo, path);
    }

    const qrPath = await this.qrQenerator(deviceId);

    const instance = await this.dbService.scooter
      .create({
        data: {
          batteryLevel: createScooterDto.batteryLevel,
          deviceId: deviceId,
          modelId: createScooterDto.modelId,
          qrCode: qrPath,
          serialNumber: createScooterDto.serialNumber,
          power: createScooterDto.power,
          addedDate: createScooterDto.addedDate,
          status: createScooterDto.status,
          photo: createScooterDto.photo ? path : null,
        },
        include: { model: true },
      })
      .catch((err) => {
        this.logger.error(err);
        return null;
      });

    return {
      scooter: instance,
      rightechScooter: res,
    };
  }

  async findAll() {
    const res = await this.rightechScooterService.getAll();

    if (!res) {
      throw new ConflictException('Не удалось получить самокаты');
    }

    const scooters = await this.dbService.scooter.findMany({
      include: {
        model: true,
        trips: {
          include: {
            user: {
              include: {
                trips: {
                  include: { scooter: true, tariff: true },
                },
              },
            },
            scooter: true,
            tariff: true,
          },
        },
      },
      orderBy: { addedDate: 'desc' },
    });
    return {
      scooters: scooters,
      rightechScooters: res,
    };
  }

  async findAllMobile() {
    const res = await this.rightechScooterService.getAll();

    if (!res) {
      throw new ConflictException('Не удалось получить самокаты Rightech');
    }

    const scooters = await this.dbService.scooter.findMany({
      include: {
        model: true,
      },
      orderBy: { addedDate: 'desc' },
    });

    if (scooters.length === 0) {
      return [];
    }

    const response = [];

    for (const scooter of scooters) {
      for (const rightechScooter of res) {
        if (scooter.deviceId === rightechScooter.id) {
          response.push({
            scooter: scooter,
            rightechScooter: rightechScooter,
          });
        }
      }
    }

    return response;
  }

  async findAllMobileTest() {
    const res = await this.rightechScooterService.getAll();

    if (!res) {
      throw new ConflictException('Не удалось получить самокаты Rightech');
    }

    const scooters = await this.dbService.scooter.findMany({
      include: {
        model: true,
      },
      orderBy: { addedDate: 'desc' },
    });

    const scooterSettings = await this.settingsService.findAll();

    if (scooters.length === 0) {
      return [];
    }

    const response = [];

    for (const scooter of scooters) {
      for (const rightechScooter of res) {
        if (scooter.deviceId === rightechScooter.id) {
          response.push({
            scooter: scooter,
            rightechScooter: rightechScooter,
            settings: scooterSettings.scooterSettings,
          });
        }
      }
    }

    return response;
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
      .update({
        where: { id: id },
        data: updateScooterDto,
        include: { model: true },
      })
      .catch((err) => {
        this.logger.error(err);
        return null;
      });
  }

  async remove(id: number, rightechScooterId: string) {
    const scooter = await this.dbService.scooter.findFirst({
      where: { id: id },
    });
    if (!scooter) {
      throw new NotFoundException('Такой записи не существует');
    }

    await this.rightechScooterService.delete(rightechScooterId);

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

    const filePath = this.generateQrPath(deviceId);

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

  private generateQrPath(deviceId: string) {
    return `uploads/images/scooters/${deviceId}/qr/qr-code.png`;
  }
}
