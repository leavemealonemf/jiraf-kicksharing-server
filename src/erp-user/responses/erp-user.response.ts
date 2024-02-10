import { $Enums, ErpUser } from '@prisma/client';
import { Exclude } from 'class-transformer';

export class ErpUserResponse implements ErpUser {
  id: number;
  name: string;
  phone: string;
  avatar: string;
  uuid: string;
  email: string;
  @Exclude()
  password: string;
  role: $Enums.ErpUserRoles;
  franchiseId: number;
  status: $Enums.ErpUserStatus;

  constructor(user: ErpUser) {
    Object.assign(this, user);
  }
}
