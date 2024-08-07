import { BadRequestException, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import * as ws from 'ws';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class WsGateway implements OnModuleInit {
  @WebSocketServer()
  server: Server;
  private externalSocket: any;
  private readonly logger = new Logger(WsGateway.name);

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    this.externalSocket = new ws('wss://dev.rightech.io/events/stream', {
      headers: {
        authorization: `Bearer ${this.config.get('RIGHTECH_TOKEN')}`,
      },
    });

    this.externalSocket.on('open', () => {
      console.log('Connected to external WebSocket server');
    });

    this.externalSocket.on('message', (message) => {
      this.server.emit(
        'messageFromExternalServer',
        JSON.parse(message.toString()),
      );
    });

    this.externalSocket.on('error', (err) => {
      this.logger.error(err);
      this.externalSocket.close(1000);
    });

    this.externalSocket.on('close', () => {
      this.logger.warn('WebSocket connection closed.');
      // setTimeout(() => this.connectToExternalSocket(), this.reconnectInterval);
    });

    this.server.on('connection', (socket) => {
      console.log(socket.id);
      console.log('connected');
    });
  }
}
