import apiClient from './axios';

export const login = (email: string, password: string) =>
  apiClient.post('/auth/login', { email, password });

export const getMe = () =>
  apiClient.get('/auth/me');

export const register = (data: {
  email: string;
  password: string;
  full_name: string;
  role: string;
  phone?: string;
  birth_date?: string;  // в формате YYYY-MM-DD
  specialization_id?: string;
  cabinet?: string;
}) => apiClient.post('/auth/register', data);