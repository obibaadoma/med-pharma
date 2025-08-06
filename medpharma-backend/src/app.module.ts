import { Module } from '@nestjs/common';
import { AppointmentsService } from './appointments/appointments.service';
import { DoctorsService } from './doctors/doctors.service';
import { QueueService } from './queue/queue.service';
import { WebsocketGateway } from './websocket/websocket.gateway';
import { AppointmentsController } from './appointments/appointments.controller';
import { DoctorsController } from './doctors/doctors.controller';

@Module({
  imports: [],
  controllers: [AppointmentsController, DoctorsController],
  providers: [
    AppointmentsService,
    DoctorsService,
    QueueService,
    WebsocketGateway,
  ],
})
export class AppModule {}