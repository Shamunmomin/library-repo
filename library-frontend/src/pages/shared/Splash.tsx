import { useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { APP_NAME, ROUTES, STEP_ROUTES } from '../../utils/constants'
import { useAuth } from '../../context/AuthContext'
import { useOnboarding } from '../../context/OnboardingContext'

export default function Splash() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { step, loading } = useOnboarding()

  const message = useMemo(() => {
    if (loading || !user) return 'Checking your account...'
    if (user.role === 'ADMIN') return 'Welcome back!'
    switch (step) {
      case 'PENDING_REVIEW':
        return 'Your payment is being reviewed by admin...'
      case 'SETUP_LIBRARY':
        return 'Setup your library to get started!'
      case 'DASHBOARD':
        return 'Welcome back!'
      default:
        return 'Redirecting to subscription...'
    }
  }, [loading, step, user])

  useEffect(() => {
    if (loading || !user) return

    const target = user.role === 'ADMIN'
      ? ROUTES.ADMIN_DASHBOARD
      : STEP_ROUTES[step ?? 'SUBSCRIBE']

    const timer = setTimeout(() => navigate(target), 1000)
    return () => clearTimeout(timer)
  }, [loading, step, user, navigate])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary-600 to-primary-900">
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, type: 'spring', stiffness: 120 }}
        className="flex flex-col items-center"
      >
        <div className="w-24 h-24 rounded-3xl bg-white/20 backdrop-blur flex items-center justify-center mb-6">
          <span className="text-4xl font-bold text-white">LP</span>
        </div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-3xl font-bold text-white mb-2"
        >
          {APP_NAME}
        </motion.h1>

        <motion.p
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="text-white/70 text-sm"
        >
          Library Management Simplified
        </motion.p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="mt-12"
      >
        <div className="flex items-center gap-2 text-white/60 text-sm">
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <span>{message}</span>
        </div>
      </motion.div>
    </div>
  )
}
