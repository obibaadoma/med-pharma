export class Doctor {
  id!: string;
  name!: string;
  specialty!: string;
  isAvailable!: boolean;
  currentAppointmentId?: string;
  averageConsultationTime!: number;
  lastAppointmentEndTime?: Date;  // Track when last appointment ended
  scheduledStartTime?: Date;      // Doctor's scheduled start time
  actualStartTime?: Date;         // When doctor actually started
}