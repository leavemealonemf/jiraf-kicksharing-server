import { YooCheckout } from '@a2seven/yoo-checkout';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export class BaseAcquiring {
  public readonly checkout: YooCheckout;
  public readonly logger: Logger;
  public readonly config = new ConfigService();

  constructor(name: string) {
    this.checkout = new YooCheckout({
      shopId: this.config.get('CASSA_SHOP_ID'),
      secretKey: this.config.get('CASSA_KEY'),
    });
    this.logger = new Logger(name);
  }
}
