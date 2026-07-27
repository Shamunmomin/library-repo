import api from './axios'
import type { AuthResponse, LoginRequest, RegisterRequest } from '../types'

export const authService = {
  async login(data: LoginRequest) {
    const response = await api.post<AuthResponse>('/auth/login', data)
    return response.data
  },

  async register(data: RegisterRequest) {
    const response = await api.post<AuthResponse>('/auth/register', data)
    return response.data
  },

  async refreshToken(refreshToken: string) {
    const response = await api.post<AuthResponse>('/auth/refresh-token', { refreshToken })
    return response.data
  },

  async logout() {
    await api.post('/auth/logout')
  },
}
