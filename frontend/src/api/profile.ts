import apiClient from './axios';
import { ProfileResponse, ProfileUpdate } from '../types';

export const getMyProfile = () => apiClient.get<ProfileResponse>('/profile/me');
export const updateMyProfile = (data: ProfileUpdate) => apiClient.put<ProfileResponse>('/profile/me', data);