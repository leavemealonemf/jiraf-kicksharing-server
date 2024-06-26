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
  status: $Enums.ErpUserStatus;
  dateTimeCreated: Date;
  inviterId: number;
  @Exclude()
  platform: $Enums.UserPlatform;

  franchiseEmployeeId: number | null;

  constructor(user: ErpUser) {
    Object.assign(this, user);
  }
}
