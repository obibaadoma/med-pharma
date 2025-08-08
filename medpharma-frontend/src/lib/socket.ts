import { io, Socket } from 'socket.io-client';
import { Appointment } from './types';

class SocketService {
  private socket: Socket | null = null;
  private appointmentId: string | null = null;

  connect() {
    this.socket = io('http://localhost:3000');

    this.socket.on('connect', () => {
      console.log('Connected to WebSocket');
      if (this.appointmentId) {
        this.subscribeToQueue(this.appointmentId);
      }
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket');
    });
  }

  subscribeToQueue(appointmentId: string) {
    this.appointmentId = appointmentId;
    if (this.socket?.connected) {
      this.socket.emit('subscribeToQueue', appointmentId);
    }
  }

  // Fixed syntax error here
  onQueueUpdate(
    callback: (data: { position: number; estimatedWaitTime: number }) => void
  ) {
    this.socket?.on('queue:update', callback);
  }

  // Fixed syntax error here
  onTurnNotification(callback: (data: { message: string }) => void) {
    this.socket?.on('appointment:turn', callback);
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
    this.appointmentId = null;
  }
}

export const socketService = new SocketService();
