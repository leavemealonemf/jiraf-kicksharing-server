import { Test, TestingModule } from '@nestjs/testing';
import { ErpUserService } from './erp-user.service';

describe('ErpUserService', () => {
  let service: ErpUserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ErpUserService],
    }).compile();

    service = module.get<ErpUserService>(ErpUserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
