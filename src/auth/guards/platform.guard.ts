import { PLATFORMS_KEY } from '@common/decorators';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserPlatform } from '@prisma/client';

@Injectable()
export class PlatformsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPlatforms = this.reflector.getAllAndOverride<UserPlatform[]>(
      PLATFORMS_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredPlatforms) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();
    return requiredPlatforms.some(
      (platform) => user.platform?.includes(platform),
    );
  }
}
