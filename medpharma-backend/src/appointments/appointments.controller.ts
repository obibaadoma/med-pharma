import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Put,
  Delete,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { QueueService } from '../queue/queue.service';
import { WebsocketGateway } from '../websocket/websocket.gateway';
import { Appointment } from './appointment.entity';

@Controller('appointments')
export class AppointmentsController {
  constructor(
    private readonly appointmentsService: AppointmentsService,
    private readonly queueService: QueueService,
    private readonly websocketGateway: WebsocketGateway
  ) {}

  @Post()
  createAppointment(@Body() body: { patientName: string; doctorId: string }) {
    // Remove unused try/catch if not needed, or remove unused 'error' variable
    const appointment = this.appointmentsService.createAppointment(
      body.patientName,
      body.doctorId
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
    const appointment = this.appointmentsService.getAppointment(id);
    if (!appointment) {
      throw new HttpException('Appointment not found', HttpStatus.NOT_FOUND);
    }
    return appointment;
  }

  @Get()
  getAllAppointments() {
    return this.appointmentsService.getAllAppointments();
  }

  @Put(':id/status')
  updateAppointmentStatus(
    @Param('id') id: string,
    @Body() body: { status: string }
  ) {
    const validStatuses: Appointment['status'][] = [
      'scheduled',
      'waiting',
      'in-progress',
      'completed',
      'cancelled',
    ];

    if (!validStatuses.includes(body.status as Appointment['status'])) {
      throw new HttpException('Invalid status', HttpStatus.BAD_REQUEST);
    }

    const success = this.appointmentsService.updateAppointmentStatus(
      id,
      body.status as Appointment['status']
    );

    if (!success) {
      throw new HttpException('Appointment not found', HttpStatus.NOT_FOUND);
    }

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

    return { success: true };
  }

  // NEW: Cancellation endpoint
  @Delete(':id')
  cancelAppointment(@Param('id') id: string) {
    const success = this.appointmentsService.updateAppointmentStatus(
      id,
      'cancelled'
    );

    if (!success) {
      throw new HttpException('Appointment not found', HttpStatus.NOT_FOUND);
    }

    // Get the appointment to update queue positions
    const appointment = this.appointmentsService.getAppointment(id);
    if (appointment) {
      this.queueService.updateQueuePositions(appointment.doctorId);

      // Notify all patients in this doctor's queue about position changes
      const queue = this.queueService.getQueueForDoctor(appointment.doctorId);
      queue.forEach(appt => {
        this.websocketGateway.sendQueueUpdate(appt.id);
      });
    }

    return { success: true, message: 'Appointment cancelled successfully' };
  }
}
