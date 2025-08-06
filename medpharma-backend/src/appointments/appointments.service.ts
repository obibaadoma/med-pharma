import { Injectable } from '@nestjs/common';
import { Appointment } from './appointment.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AppointmentsService {
  private appointments: Map<string, Appointment> = new Map();
  
  createAppointment(patientName: string, doctorId: string): Appointment {
    const appointment: Appointment = {
      id: uuidv4(),
      patientName,
      doctorId,
      scheduledTime: new Date(),
      status: 'waiting',
      createdAt: new Date(),
    };
    
    this.appointments.set(appointment.id, appointment);
    return appointment;
  }
  
  getAppointment(id: string): Appointment | undefined {
    return this.appointments.get(id);
  }
  
  getAllAppointments(): Appointment[] {
    return Array.from(this.appointments.values());
  }
  
  updateAppointmentStatus(id: string, status: Appointment['status']): boolean {
    const appointment = this.appointments.get(id);
    if (appointment) {
      appointment.status = status;
      return true;
    }
    return false;
  }
  
  getAppointmentsByDoctorId(doctorId: string): Appointment[] {
    return Array.from(this.appointments.values()).filter(
      appt => appt.doctorId === doctorId
    );
  }
}