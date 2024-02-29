import { $Enums, TokenErp } from '@prisma/client';

export interface Tokens {
  accessToken: string;
  refreshToken: TokenErp;
}

export interface JwtPayload {
  id: number;
  email: number;
  name: string | null;
  avatar: string | null;
  phone: string | null;
  uuid: string;
  platform: $Enums.UserPlatform;
}
