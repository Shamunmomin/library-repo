import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';

export function GuestRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, getDashboardPath } = useAuth();
  const { colors } = useTheme();

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${colors.bg.secondary}`}>
        <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${colors.spinner}`}></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={getDashboardPath()} replace />;
  }

  return <>{children}</>;
}
