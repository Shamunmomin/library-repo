import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { userService } from '../../services/userService'
import { APP_NAME, ROUTES } from '../../utils/constants'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

type SplashState = 'loading' | 'redirect'

interface SplashProps {
  returnTo?: string
  onDone?: () => void
}

export default function Splash({ returnTo, onDone }: SplashProps) {
  const navigate = useNavigate()
  const { logout, user } = useAuth()
  const [message, setMessage] = useState('Checking your account...')
  const [state, setState] = useState<SplashState>('loading')

  const go = useCallback((path: string) => {
    onDone?.()
    navigate(path)
  }, [navigate, onDone])

  useEffect(() => {
    let cancelled = false

    async function checkOnboarding() {
      try {
        if (user?.role === 'ADMIN') {
          setMessage('Welcome back!')
          setTimeout(() => go(returnTo ?? ROUTES.ADMIN_DASHBOARD), 1000)
          return
        }

        const status = await userService.getOnboardingStatus()

        if (cancelled) return

        if (!status.hasSubscription) {
          setMessage('Redirecting to subscription...')
          setTimeout(() => go(ROUTES.SUBSCRIBE), 1500)
        } else if (status.subscription?.status === 'PENDING') {
          setMessage('Your payment is being reviewed by admin...')
        } else if (status.subscription?.status === 'REJECTED') {
          setMessage('Your previous request was rejected. Please resubscribe.')
          setTimeout(() => go(ROUTES.SUBSCRIBE), 2000)
        } else if (status.subscription?.status === 'EXPIRED') {
          setMessage('Your subscription has expired. Please resubscribe.')
          setTimeout(() => go(ROUTES.SUBSCRIBE), 2000)
        } else if (status.subscription?.status === 'ACTIVE' && !status.hasLibrary) {
          setMessage('Setup your library to get started!')
          setTimeout(() => go(returnTo ?? '/owner/library'), 1500)
        } else if (status.subscription?.status === 'ACTIVE' && status.hasLibrary) {
          setMessage('Welcome back!')
          setTimeout(() => go(returnTo ?? ROUTES.OWNER_DASHBOARD), 1500)
        } else {
          setMessage('Something went wrong. Please contact support.')
        }
      } catch {
        if (!cancelled) {
          toast.error('Session expired. Please login again.')
          await logout()
          go(ROUTES.LOGIN)
        }
      } finally {
        if (!cancelled) {
          setState('redirect')
        }
      }
    }

    const timer = setTimeout(checkOnboarding, 2500)
    return () => { cancelled = true; clearTimeout(timer) }
  }, [navigate, logout, user, returnTo, go])

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

      {state === 'redirect' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mt-4"
        >
          <button
            onClick={() => navigate(ROUTES.LOGIN)}
            className="text-white/50 hover:text-white text-xs underline transition-colors"
          >
            Back to login
          </button>
        </motion.div>
      )}
    </div>
  )
}
