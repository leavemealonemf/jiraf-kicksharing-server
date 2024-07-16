import { Module } from '@nestjs/common';
import { ClientRedirectController } from './client-redirect.controller';

@Module({
  controllers: [ClientRedirectController],
})
export class ClientRedirectModule {}
