import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { AuthContext } from './AuthContext';
import { authApi } from '../services/authService';
import type { AuthResponse, LoginRequest, RegisterRequest } from '../types/auth';
import { Role } from '../types/auth';
import toast from 'react-hot-toast';

const USER_STORAGE_KEY = 'user';

function getDashboardPath(role: Role): string {
  return role === Role.SUPER_ADMIN ? '/admin/dashboard' : '/dashboard';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthResponse | null>(() => {
    const stored = localStorage.getItem(USER_STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored) as AuthResponse;
      } catch {
        return null;
      }
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState(() => {
    return !!localStorage.getItem('accessToken');
  });

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    authApi.getProfile()
      .then((response) => {
        const profile = response.data;
        const stored = user;
        const merged = stored
          ? { ...stored, ...profile, accessToken: stored.accessToken, refreshToken: stored.refreshToken }
          : profile;
        setUser(merged);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(merged));
      })
      .catch(() => {
        localStorage.clear();
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const saveUser = useCallback((authData: AuthResponse) => {
    localStorage.setItem('accessToken', authData.accessToken);
    localStorage.setItem('refreshToken', authData.refreshToken);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(authData));
    setUser(authData);
  }, []);

  const login = async (data: LoginRequest) => {
    const response = await authApi.login(data);
    const authData = response.data;
    saveUser(authData);
    toast.success('Login successful!');
  };

  const register = async (data: RegisterRequest) => {
    const response = await authApi.register(data);
    const authData = response.data;
    saveUser(authData);
    toast.success('Registration successful!');
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    toast.success('Logged out successfully');
  };

  const getDashboardPathForUser = useCallback(() => {
    if (!user) return '/login';
    return getDashboardPath(user.role);
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        getDashboardPath: getDashboardPathForUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
