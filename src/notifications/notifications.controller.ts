import { Controller, Sse, MessageEvent } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Observable, fromEvent, map } from 'rxjs';

@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Sse('/sse')
  async notification(): Promise<Observable<MessageEvent>> {
    return fromEvent(this.eventEmitter, 'sse.event').pipe(
      map((payload) => ({
        data: JSON.stringify(payload),
      })),
    );
  }
}
