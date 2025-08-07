import { Controller, Get, Param } from '@nestjs/common';
import { DoctorsService } from './doctors.service';
import { QueueService } from '../queue/queue.service';

@Controller('doctors')
export class DoctorsController {
  constructor(
    private readonly doctorsService: DoctorsService,
    private readonly queueService: QueueService
  ) {}

  @Get()
  getAllDoctors() {
    return this.doctorsService.getAllDoctors();
  }

  @Get(':id')
  getDoctor(@Param('id') id: string) {
    return this.doctorsService.getDoctor(id);
  }

  @Get(':id/queue')
  getDoctorQueue(@Param('id') id: string) {
    const queue = this.queueService.getQueueForDoctor(id);
    return { queue };
  }
}
