import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import type { Role } from '../types/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { colors } = useTheme();

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${colors.bg.secondary}`}>
        <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${colors.spinner}`}></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    const fallbackPath = user.role === 'SUPER_ADMIN' ? '/admin/dashboard' : '/dashboard';
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
}
