import apiClient from './axios';
import { Specialization } from '../types';

export const getSpecializations = () => apiClient.get('/specializations');
export const createSpecialization = (data: { name: string }) => apiClient.post('/specializations', data);
export const updateSpecialization = (id: string, data: { name: string }) => apiClient.put(`/specializations/${id}`, data);
export const deleteSpecialization = (id: string) => apiClient.delete(`/specializations/${id}`);