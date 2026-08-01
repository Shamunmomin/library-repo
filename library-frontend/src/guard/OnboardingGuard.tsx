import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useOnboarding } from '../context/OnboardingContext'
import { ROUTES, STEP_ROUTES } from '../utils/constants'
import LoadingSpinner from '../components/LoadingSpinner'
import type { OnboardingStep } from '../types'
import type { ReactNode } from 'react'

interface OnboardingGuardProps {
  children: ReactNode
  allowedSteps: OnboardingStep[]
}

export function OnboardingGuard({ children, allowedSteps }: OnboardingGuardProps) {
  const { user } = useAuth()
  const { step, loading, refresh } = useOnboarding()

  if (user?.role === 'ADMIN') {
    return <Navigate to={ROUTES.ADMIN_DASHBOARD} replace />
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (step === null) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50 dark:bg-gray-900">
        <p className="text-sm text-gray-500 dark:text-gray-400">Could not load your account status.</p>
        <button
          onClick={() => refresh()}
          className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  if (!allowedSteps.includes(step)) {
    return <Navigate to={STEP_ROUTES[step]} replace />
  }

  return <>{children}</>
}
