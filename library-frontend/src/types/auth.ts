export const Role = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  LIBRARY_OWNER: 'LIBRARY_OWNER',
} as const;

export type Role = typeof Role[keyof typeof Role];

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  userId: string;
  name: string;
  email: string;
  username: string;
  role: Role;
  libraryId: string | null;
  isSubscribed: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  username: string;
  password: string;
  role: Role;
}

export type { ApiResponse } from './api';
