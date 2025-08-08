import axios from 'axios';
import { Appointment, Doctor } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const appointmentApi = {
  create: (data: { patientName: string; doctorId: string }) =>
    api.post<Appointment>('/appointments', data),

  get: (id: string) => api.get<Appointment>(`/appointments/${id}`),

  updateStatus: (id: string, status: Appointment['status']) =>
    api.put(`/appointments/${id}/status`, { status }),

  // NEW: Cancellation method
  cancel: (id: string) => api.delete(`/appointments/${id}`),
};

export const doctorApi = {
  getAll: () => api.get<Doctor[]>('/doctors'),

  get: (id: string) => api.get<Doctor>(`/doctors/${id}`),

  getQueue: (id: string) => api.get(`/doctors/${id}/queue`),
};
