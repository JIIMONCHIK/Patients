import apiClient from './axios';
import { Patient } from '../types';

export const getPatients = (skip = 0, limit = 100) =>
  apiClient.get(`/patients?skip=${skip}&limit=${limit}`);

export const getPatient = (id: string) => apiClient.get(`/patients/${id}`);

export const createPatient = (data: Omit<Patient, 'id' | 'user_id'>) =>
  apiClient.post('/patients', data);

export const updatePatient = (id: string, data: Partial<Patient>) =>
  apiClient.put(`/patients/${id}`, data);

export const deletePatient = (id: string) => apiClient.delete(`/patients/${id}`);