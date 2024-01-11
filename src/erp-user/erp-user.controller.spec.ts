import { Test, TestingModule } from '@nestjs/testing';
import { ErpUserController } from './erp-user.controller';
import { ErpUserService } from './erp-user.service';

describe('ErpUserController', () => {
  let controller: ErpUserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ErpUserController],
      providers: [ErpUserService],
    }).compile();

    controller = module.get<ErpUserController>(ErpUserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
