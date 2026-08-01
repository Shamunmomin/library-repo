import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { fetchEventSource } from '@microsoft/fetch-event-source'
import type { OnboardingStatus, OnboardingStep } from '../types'
import { userService } from '../services/userService'
import { useAuth } from './AuthContext'

interface OnboardingContextType {
  status: OnboardingStatus | null
  step: OnboardingStep | null
  notice: string | null
  loading: boolean
  refresh: () => Promise<OnboardingStatus | null>
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined)

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [status, setStatus] = useState<OnboardingStatus | null>(null)
  const [loading, setLoading] = useState(true)

  const isOwner = user?.role === 'OWNER'

  const refresh = useCallback(async () => {
    try {
      if (!isOwner) {
        setStatus(null)
        return null
      }
      const data = await userService.getOnboardingStatus()
      setStatus(data)
      return data
    } catch {
      return null
    } finally {
      setLoading(false)
    }
  }, [isOwner])

  useEffect(() => {
    let cancelled = false
    let controller: AbortController | null = null

    async function start() {
      await refresh()
      if (cancelled || !isOwner) return

      const token = sessionStorage.getItem('accessToken')
      if (!token) return

      controller = new AbortController()
      try {
        await fetchEventSource('/api/subscriptions/events', {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
          onopen: async () => {
            // reconnected: status may have changed while offline
            await refresh()
          },
          onmessage: () => {
            refresh()
          },
        })
      } catch {
        // aborted or unreachable; provider-level fetch handles the rest
      }
    }

    start()
    return () => {
      cancelled = true
      controller?.abort()
    }
  }, [isOwner, refresh])

  return (
    <OnboardingContext.Provider
      value={{
        status,
        step: status?.nextStep ?? null,
        notice: status?.notice ?? null,
        loading,
        refresh,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  )
}

export function useOnboarding() {
  const context = useContext(OnboardingContext)
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider')
  }
  return context
}
