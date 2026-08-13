import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ROUTES } from '../utils/constants'
import type { ReactNode } from 'react'

interface GuestGuardProps {
  children: ReactNode
}

export function GuestGuard({ children }: GuestGuardProps) {
  const { isAuthenticated, user } = useAuth()

  if (isAuthenticated) {
    return <Navigate to={user?.role === 'ADMIN' ? ROUTES.ADMIN_DASHBOARD : ROUTES.SPLASH} replace />
  }

  return <>{children}</>
}