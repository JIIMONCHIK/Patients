import apiClient from './axios';
import { Appointment } from '../types';

export const getAppointments = (params?: {
  skip?: number;
  limit?: number;
  patient_id?: string;
  doctor_id?: string;
  date_from?: string;
  date_to?: string;
  specialization_id?: string;
  status?: string; 
}) => apiClient.get('/appointments', { params });
export const createAppointment = (data: { slot_id: string; patient_id?: string }) => apiClient.post('/appointments', data);
export const cancelAppointment = (id: string) => apiClient.delete(`/appointments/${id}/cancel`);