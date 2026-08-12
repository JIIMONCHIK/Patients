import apiClient from './axios';
import { Doctor } from '../types';


export const getDoctors = (params?: {
  skip?: number;
  limit?: number;
  specialization_id?: string;
  has_available_slots?: boolean;
}) => apiClient.get('/doctors', { params });
export const getDoctor = (id: string) => apiClient.get(`/doctors/${id}`);
export const createDoctor = (data: Omit<Doctor, 'id'>) => apiClient.post('/doctors', data);
export const updateDoctor = (id: string, data: Partial<Doctor>) => apiClient.put(`/doctors/${id}`, data);
export const deleteDoctor = (id: string) => apiClient.delete(`/doctors/${id}`);