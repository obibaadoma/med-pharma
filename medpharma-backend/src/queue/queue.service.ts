import { Injectable } from '@nestjs/common';
import { AppointmentsService } from '../appointments/appointments.service';
import { DoctorsService } from '../doctors/doctors.service';
import { Appointment } from '../appointments/appointment.entity';

@Injectable()
export class QueueService {
  constructor(
    private readonly appointmentsService: AppointmentsService,
    private readonly doctorsService: DoctorsService,
  ) {}
  
  getQueueForDoctor(doctorId: string): Appointment[] {
    const allAppointments = this.appointmentsService.getAllAppointments();
    const doctorAppointments = allAppointments.filter(
      appt => appt.doctorId === doctorId && 
      (appt.status === 'waiting' || appt.status === 'in-progress')
    );
    
    // Sort by creation time
    return doctorAppointments.sort((a, b) => 
      a.createdAt.getTime() - b.createdAt.getTime()
    );
  }
  
  getAppointmentPosition(appointmentId: string): number | null {
    const appointment = this.appointmentsService.getAppointment(appointmentId);
    if (!appointment) return null;
    
    const queue = this.getQueueForDoctor(appointment.doctorId);
    const position = queue.findIndex(appt => appt.id === appointmentId);
    return position !== -1 ? position + 1 : null;
  }
  
  getEstimatedWaitTime(appointmentId: string): number | null {
    const appointment = this.appointmentsService.getAppointment(appointmentId);
    if (!appointment) return null;
    
    const doctor = this.doctorsService.getDoctor(appointment.doctorId);
    if (!doctor) return null;
    
    const position = this.getAppointmentPosition(appointmentId);
    if (position === null) return null;
    
    // Calculate based on position and average consultation time
    return (position - 1) * doctor.averageConsultationTime;
  }
  
  updateQueuePositions(doctorId: string): void {
    const queue = this.getQueueForDoctor(doctorId);
    queue.forEach((appointment, index) => {
      appointment.position = index + 1;
      const doctor = this.doctorsService.getDoctor(doctorId);
      if (doctor) {
        appointment.estimatedWaitTime = index * doctor.averageConsultationTime;
      }
    });
  }
}