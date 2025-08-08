import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { QueueService } from '../queue/queue.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class WebsocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server; // Add definite assignment assertion

  private connectedClients: Map<string, string> = new Map(); // socketId -> appointmentId

  constructor(private readonly queueService: QueueService) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    this.connectedClients.delete(client.id);
  }

  @SubscribeMessage('subscribeToQueue')
  handleSubscribeToQueue(client: Socket, appointmentId: string): void {
    this.connectedClients.set(client.id, appointmentId);
    this.sendQueueUpdate(appointmentId);
  }

  sendQueueUpdate(appointmentId: string): void {
    const position = this.queueService.getAppointmentPosition(appointmentId);
    const waitTime = this.queueService.getEstimatedWaitTime(appointmentId);

    // Find the socket for this appointment
    for (const [socketId, apptId] of this.connectedClients.entries()) {
      if (apptId === appointmentId) {
        this.server.to(socketId).emit('queue:update', {
          position,
          estimatedWaitTime: waitTime,
        });
        break;
      }
    }
  }

  notifyTurn(appointmentId: string): void {
    for (const [socketId, apptId] of this.connectedClients.entries()) {
      if (apptId === appointmentId) {
        this.server.to(socketId).emit('appointment:turn', {
          message: "It's your turn! Please prepare to join the call.",
        });
        break;
      }
    }
  }
}
