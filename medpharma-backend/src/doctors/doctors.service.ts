import { Injectable } from '@nestjs/common';
import { Doctor } from './doctor.entity';

@Injectable()
export class DoctorsService {
  private doctors: Map<string, Doctor> = new Map();
  
  constructor() {
    // Initialize with sample doctors
    this.doctors.set('doc1', {
      id: 'doc1',
      name: 'Dr. Smith',
      specialty: 'General Medicine',
      isAvailable: true,
      averageConsultationTime: 15,
    });
    
    this.doctors.set('doc2', {
      id: 'doc2',
      name: 'Dr. Johnson',
      specialty: 'Pediatrics',
      isAvailable: true,
      averageConsultationTime: 20,
    });
  }
  
  getDoctor(id: string): Doctor | undefined {
    return this.doctors.get(id);
  }
  
  getAllDoctors(): Doctor[] {
    return Array.from(this.doctors.values());
  }
  
  updateDoctorStatus(id: string, isAvailable: boolean): boolean {
    const doctor = this.doctors.get(id);
    if (doctor) {
      doctor.isAvailable = isAvailable;
      return true;
    }
    return false;
  }
}