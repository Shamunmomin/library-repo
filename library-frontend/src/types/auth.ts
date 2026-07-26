export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  LIBRARY_OWNER = 'LIBRARY_OWNER',
}

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

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
