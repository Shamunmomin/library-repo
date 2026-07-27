import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { ReactNode } from 'react'

interface AuthGuardProps {
  children: ReactNode
  requiredRole?: 'OWNER' | 'ADMIN'
}

export function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const { isAuthenticated, user } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (requiredRole && user?.role !== requiredRole) {
    const redirectPath = user?.role === 'ADMIN' ? '/admin/dashboard' : '/owner/dashboard'
    return <Navigate to={redirectPath} replace />
  }

  return <>{children}</>
}
