export class Appointment {
  id: string;
  patientName: string;
  doctorId: string;
  scheduledTime: Date;
  status: 'scheduled' | 'waiting' | 'in-progress' | 'completed' | 'cancelled';
  createdAt: Date;
  position?: number;
  estimatedWaitTime?: number;
}
