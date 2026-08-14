import apiClient from './axios';
import { MedicalRecord } from '../types';

export const getMedicalRecords = () => apiClient.get('/medical-records');
export const createMedicalRecord = (data: {
  appointment_id: string;
  diagnosis?: string;
  complaints?: string;
  prescriptions?: string;
  recommendations?: string;
}) => apiClient.post('/medical-records', data);
export const updateMedicalRecord = (id: string, data: Partial<MedicalRecord>) =>
  apiClient.put(`/medical-records/${id}`, data);