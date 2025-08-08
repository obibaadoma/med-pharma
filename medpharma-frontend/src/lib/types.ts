export interface Appointment {
  id: string;
  patientName: string;
  doctorId: string;
  scheduledTime: string;
  status: 'scheduled' | 'waiting' | 'in-progress' | 'completed' | 'cancelled';
  createdAt: string;
  position?: number;
  estimatedWaitTime?: number;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  isAvailable: boolean;
  averageConsultationTime: number;
}
