import { UseGuards } from '@nestjs/common';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { NotificationService } from './notification.service';
import { WsGuard } from '../WSGuard';

@WebSocketGateway(Number(process.env.PORT) || 5001, { cors: '*' })
export class NotificationGateway {
  constructor(private notificationService: NotificationService) {}

  @WebSocketServer()
  server;

  @UseGuards(WsGuard)
  @SubscribeMessage('connection')
  async handleConnection(socket: any, data: any) {
    if (data?._id) {
      const _data = {
        socketId: socket?.id,
        userId: data?._id,
      };
      await this.notificationService.createNotification(_data);
    }
  }

  // @SubscribeMessage('Auth')
  // handleAuth(@MessageBody() message: any) {
  //   console.log('User _ID ==>', message);
  //   // this.server.emit('Auth', message);
  //   this.server.on('Auth', (socket) => {
  //     console.log(`New client connected ${socket.id}`);
  //   });
  // }

  // @SubscribeMessage('test')
  // handleMessage(@MessageBody() message: any) {
  //   console.log('server log', message);
  //   this.server.emit('test', message);
  // }
}
