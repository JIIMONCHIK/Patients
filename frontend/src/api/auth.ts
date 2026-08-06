import apiClient from './axios';

export const login = (email: string, password: string) =>
  apiClient.post('/auth/login', { email, password });

export const getMe = () =>
  apiClient.get('/auth/me'); // добавим этот эндпоинт на бэкенде