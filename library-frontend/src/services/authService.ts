import api from '../lib/axios';
import type { AuthResponse, LoginRequest, RegisterRequest } from '../types/auth';
import type { ApiResponse } from '../types/api';

export const authApi = {
  login: async (data: LoginRequest): Promise<ApiResponse<AuthResponse>> => {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<ApiResponse<AuthResponse>> => {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', data);
    return response.data;
  },

  refreshToken: async (refreshToken: string): Promise<ApiResponse<AuthResponse>> => {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/refresh', refreshToken);
    return response.data;
  },

  getProfile: async (): Promise<ApiResponse<AuthResponse>> => {
    const response = await api.get<ApiResponse<AuthResponse>>('/auth/profile');
    return response.data;
  },
};
