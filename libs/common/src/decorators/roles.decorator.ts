import { SetMetadata } from '@nestjs/common';
import { ErpUserRoles } from '@prisma/client';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: ErpUserRoles[]) =>
  SetMetadata(ROLES_KEY, roles);
