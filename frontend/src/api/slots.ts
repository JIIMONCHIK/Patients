import apiClient from './axios';
import { AppointmentSlot } from '../types';

export const getSlots = (params?: { doctor_id?: string; is_available?: boolean }) =>
  apiClient.get('/slots', { params });