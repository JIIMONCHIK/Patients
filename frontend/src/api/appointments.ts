import apiClient from './axios';
import { Appointment } from '../types';

export const getAppointments = () => apiClient.get('/appointments');
export const createAppointment = (data: Omit<Appointment, 'id' | 'created_at'>) => apiClient.post('/appointments', data);
export const cancelAppointment = (id: string) => apiClient.delete(`/appointments/${id}/cancel`);