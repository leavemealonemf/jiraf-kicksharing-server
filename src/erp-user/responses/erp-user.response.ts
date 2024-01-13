import { ErpUser } from '@prisma/client';
import { Exclude } from 'class-transformer';

export class ErpUserResponse implements ErpUser {
  id: number;
  name: string;
  phone: string;
  email: string;
  @Exclude()
  password: string;
  franchiseId: number;

  constructor(user: ErpUser) {
    Object.assign(this, user);
  }
}
