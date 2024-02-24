import { PrismaClient } from '@prisma/client';
import { generateUUID } from '@common/utils';
import { GeofenceDrawType } from '@prisma/client';
import { ForbiddenException } from '@nestjs/common';

const prisma = new PrismaClient();

async function createGeofenceType() {
  const data = [
    {
      colorHex: '#F32C2C',
      uuid: generateUUID(),
      name: 'Зона аренды',
      drawType: GeofenceDrawType.POLYGON,
      slug: 'mainZone',
      canParking: true,
      canRiding: true,
      isScooterBehavior: true,
      noiceToTheClient: true,

      speedReduction: 5,
      notificationMessage:
        'Внимание! Вы заехали в зону, где кататься запрещено. Вернитесь обратно.',
    },
    {
      colorHex: '#52F66C',
      uuid: generateUUID(),
      name: 'Парковка платная (круговая)',
      subTitle: 'Здесь начинают и завершают аренду',
      drawType: GeofenceDrawType.CIRCLE,
      slug: 'paidParkingCircle',
      canParking: true,
      canRiding: true,
      description: 'Здесь вы можете завершить аренду за деньги',
      parkingPrice: 50,
    },
    {
      colorHex: '#2CABF3',
      uuid: generateUUID(),
      subTitle: 'Здесь начинают и завершают аренду',
      name: 'Зона парковки (полигон)',
      drawType: GeofenceDrawType.POLYGON,
      slug: 'parkingPolygon',
      canParking: true,
      canRiding: true,
    },
    {
      colorHex: '#2CABF3',
      uuid: generateUUID(),
      name: 'Парковка (круговая)',
      subTitle: 'Здесь начинают и завершают аренду',
      drawType: GeofenceDrawType.CIRCLE,
      slug: 'parkingCircle',
      canParking: true,
      canRiding: true,
    },
    {
      colorHex: '#414044',
      uuid: generateUUID(),
      name: 'Зона запрета парковки',
      subTitle: 'Круглосуточно',
      drawType: GeofenceDrawType.POLYGON,
      slug: 'notParking',
      canParking: false,
      canRiding: true,
      description:
        'Здесь нельзя парковаться и оставлять самокаты, даже ненадолго',
      parkingFinePrice: 100,
    },
    {
      colorHex: '#F32C2C',
      uuid: generateUUID(),
      name: 'Зона запрета поездок',
      subTitle: 'Круглосуточно',
      drawType: GeofenceDrawType.POLYGON,
      slug: 'notScooters',
      canParking: false,
      canRiding: false,
      description:
        'Здесь запрещено кататься. Наслаждайтесь остальной частью города',
      isScooterBehavior: true,
      noiceToTheClient: true,

      parkingFinePrice: 100,
      speedReduction: 5,
      notificationMessage:
        'Внимание! Вы заехали в зону, где кататься запрещено. Вернитесь обратно.',
    },
    {
      colorHex: '#414044',
      uuid: generateUUID(),
      name: 'Зона контроля скорости: круглосуточно',
      subTitle: 'Круглосуточно',
      drawType: GeofenceDrawType.POLYGON,
      slug: 'speedLimitAllDay',
      canParking: false,
      canRiding: true,
      description:
        'Скорость самоката автоматически снизится, так безопаснее для всех',
    },
    {
      colorHex: '#414044',
      uuid: generateUUID(),
      name: 'Зона контроля скорости: по расписанию',
      subTitle: 'По расписанию',
      drawType: GeofenceDrawType.POLYGON,
      slug: 'speedLimitSchedule',
      canParking: false,
      canRiding: true,
      description:
        'Скорость самоката автоматически снизится, так безопаснее для всех',
      secondDescription:
        'Сейчас нет никаких ограничений, скорость самоката не измениться',
    },
  ];

  data.forEach(async (obj) => {
    const res = await this.dbService.geofenceType.create({
      data: {
        colorHex: obj.colorHex,
        uuid: obj.uuid,
        slug: obj.slug,
        name: obj.name,
        drawType: obj.drawType,
        subTitle: obj.subTitle,
        canParking: obj.canParking,
        canRiding: obj.canRiding,
        description: obj.description,
        parkingPrice: obj.parkingPrice,
        isScooterBehavior: obj.isScooterBehavior,
        noiceToTheClient: obj.noiceToTheClient,
        secondDescription: obj.secondDescription,
      },
    });

    if (!res) {
      throw new ForbiddenException('Ошибка при создании типов зон');
    }

    const elementIndex = data.findIndex((element) => {
      return element.uuid === res.uuid;
    });

    await this.dbService.geofenceTypeParams.create({
      data: {
        geofenceTypeId: res.id,
        parkingFinePrice: data[elementIndex]?.parkingFinePrice,
        speedReduction: data[elementIndex]?.speedReduction,
        notificationMessage: data[elementIndex]?.notificationMessage,
      },
    });
  });
}

async function main() {
  try {
    await createGeofenceType();
    console.log('Данные успешно добавлены в таблицу');
  } catch (error) {
    console.error('Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
