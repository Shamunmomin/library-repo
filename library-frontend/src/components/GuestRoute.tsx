import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function GuestRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, getDashboardPath } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={getDashboardPath()} replace />;
  }

  return <>{children}</>;
}
