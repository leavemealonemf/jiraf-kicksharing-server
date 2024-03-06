import { SetMetadata } from '@nestjs/common';
import { UserPlatform } from '@prisma/client';

export const PLATFORMS_KEY = 'platforms';
export const Platforms = (...platforms: UserPlatform[]) =>
  SetMetadata(PLATFORMS_KEY, platforms);
