import { RegisterDto } from 'src/auth/dto';

export class ConnectOwnerToFranchiseDto {
  franchiseId: number;
  registerInfo: RegisterDto;
}
