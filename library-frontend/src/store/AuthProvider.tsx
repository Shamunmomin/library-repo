import { useState, useEffect, type ReactNode } from 'react';
import { AuthContext, type AuthContextType } from './AuthContext';
import { authApi } from '../api/auth';
import type { LoginRequest, RegisterRequest } from '../types/auth';
import toast from 'react-hot-toast';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthContextType['user']>(null);
  const [isLoading, setIsLoading] = useState(() => {
    return !!localStorage.getItem('accessToken');
  });

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    authApi.getProfile()
      .then((response) => {
        setUser(response.data);
      })
      .catch(() => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (data: LoginRequest) => {
    const response = await authApi.login(data);
    const authData = response.data;
    localStorage.setItem('accessToken', authData.accessToken);
    localStorage.setItem('refreshToken', authData.refreshToken);
    setUser(authData);
    toast.success('Login successful!');
  };

  const register = async (data: RegisterRequest) => {
    const response = await authApi.register(data);
    const authData = response.data;
    localStorage.setItem('accessToken', authData.accessToken);
    localStorage.setItem('refreshToken', authData.refreshToken);
    setUser(authData);
    toast.success('Registration successful!');
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
