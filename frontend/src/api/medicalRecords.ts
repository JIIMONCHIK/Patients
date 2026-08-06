import apiClient from './axios';
import { MedicalRecord } from '../types';

export const getMedicalRecords = () => apiClient.get('/medical-records');
export const createMedicalRecord = (data: Omit<MedicalRecord, 'id' | 'created_at' | 'updated_at'>) =>
  apiClient.post('/medical-records', data);
export const updateMedicalRecord = (id: string, data: Partial<MedicalRecord>) =>
  apiClient.put(`/medical-records/${id}`, data);