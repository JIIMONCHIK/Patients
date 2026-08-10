import apiClient from './axios';
import { Appointment } from '../types';

export const getAppointments = () => apiClient.get('/appointments');
export const createAppointment = (data: { slot_id: string; patient_id?: string }) => apiClient.post('/appointments', data);
export const cancelAppointment = (id: string) => apiClient.delete(`/appointments/${id}/cancel`);