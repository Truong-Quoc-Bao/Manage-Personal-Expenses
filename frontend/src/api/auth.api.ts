import axiosInstance from './axiosInstance';

export const authApi = {
  login: (data: any) => axiosInstance.post('/api/auth/login', data),
  register: (data: any) => axiosInstance.post('/api/auth/register', data),
  forgotPassword: (email: string) => axiosInstance.post('/api/auth/forgot-password', { email }),
  resetPassword: (data: any) => axiosInstance.post('/api/auth/reset-password', data),
};