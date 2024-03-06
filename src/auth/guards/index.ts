import { JwtAuthGuard } from './jwt-auth.guard';
import { PlatformsGuard } from './platform.guard';
import { RolesGuard } from './role.guard';

export const GUARDS = [JwtAuthGuard, RolesGuard, PlatformsGuard];
