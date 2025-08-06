import { Controller, Get, Post, Param, Body, Put } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { QueueService } from '../queue/queue.service';
import { WebsocketGateway } from '../websocket/websocket.gateway';

@Controller('appointments')
export class AppointmentsController {
  constructor(
    private readonly appointmentsService: AppointmentsService,
    private readonly queueService: QueueService,
    private readonly websocketGateway: WebsocketGateway,
  ) {}
  
  @Post()
  createAppointment(@Body() body: { patientName: string; doctorId: string }) {
    const appointment = this.appointmentsService.createAppointment(
      body.patientName,
      body.doctorId,
    );
    
    // Update queue positions
    this.queueService.updateQueuePositions(body.doctorId);
    
    // Notify all patients in this doctor's queue
    const queue = this.queueService.getQueueForDoctor(body.doctorId);
    queue.forEach(appt => {
      this.websocketGateway.sendQueueUpdate(appt.id);
    });
    
    return appointment;
  }
  
  @Get(':id')
  getAppointment(@Param('id') id: string) {
    return this.appointmentsService.getAppointment(id);
  }
  
  @Put(':id/status')
  updateAppointmentStatus(
    @Param('id') id: string,
    @Body() body: { status: string },
  ) {
    const success = this.appointmentsService.updateAppointmentStatus(
      id,
      body.status as any,
    );
    
    if (success) {
      const appointment = this.appointmentsService.getAppointment(id);
      if (appointment) {
        this.queueService.updateQueuePositions(appointment.doctorId);
        
        // Notify all patients in this doctor's queue
        const queue = this.queueService.getQueueForDoctor(appointment.doctorId);
        queue.forEach(appt => {
          this.websocketGateway.sendQueueUpdate(appt.id);
        });
        
        // Notify if it's someone's turn
        if (body.status === 'in-progress') {
          if (queue.length > 1) {
            const nextAppointment = queue[1];
            this.websocketGateway.notifyTurn(nextAppointment.id);
          }
        }
        
        // If completing current appointment, start next one
        if (body.status === 'completed' || body.status === 'cancelled') {
          if (queue.length > 0) {
            const nextAppointment = queue[0];
            if (nextAppointment.id !== id) {
              this.websocketGateway.notifyTurn(nextAppointment.id);
            }
          }
        }
      }
    }
    
    return { success };
  }
}