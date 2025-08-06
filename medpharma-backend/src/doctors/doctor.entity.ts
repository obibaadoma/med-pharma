export class Doctor {
  id: string;
  name: string;
  specialty: string;
  isAvailable: boolean;
  currentAppointmentId?: string;
  averageConsultationTime: number; // in minutes
}