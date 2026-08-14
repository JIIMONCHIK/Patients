import apiClient from './axios';
import { ScheduleTemplate, ScheduleTemplateCreate } from '../types';

export const getSchedules = () => apiClient.get<ScheduleTemplate[]>('/schedules');
export const createSchedule = (data: ScheduleTemplateCreate) => apiClient.post<ScheduleTemplate[]>('/schedules', data);
export const updateSchedule = (id: string, data: Partial<ScheduleTemplateCreate>) =>
  apiClient.put(`/schedules/${id}`, data);
export const deleteSchedule = (id: string) => apiClient.delete(`/schedules/${id}`);
export const generateSlots = (days = 7) => apiClient.post('/schedules/generate', null, { params: { days } });