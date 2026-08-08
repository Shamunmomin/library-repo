import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { fetchEventSource } from '@microsoft/fetch-event-source'
import type { OnboardingStatus, OnboardingStep, Subscription } from '../types'
import { userService } from '../services/userService'
import { authService } from '../services/authService'
import { useAuth } from './AuthContext'

const SSE_EVENTS_URL = `${import.meta.env.VITE_API_PROXY_TARGET}/api/subscriptions/events`

async function refreshAccessToken() {
  const refreshToken = sessionStorage.getItem('refreshToken')
  if (!refreshToken) throw new Error('No refresh token')
  const data = await authService.refreshToken(refreshToken)
  sessionStorage.setItem('accessToken', data.accessToken)
  sessionStorage.setItem('refreshToken', data.refreshToken)
}

interface OnboardingContextType {
  status: OnboardingStatus | null
  step: OnboardingStep | null
  notice: string | null
  subscription: Subscription | null
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
        await fetchEventSource(SSE_EVENTS_URL, {
          fetch: (input, init) => {
            const token = sessionStorage.getItem('accessToken')
            const headers = {
              ...((init?.headers ?? {}) as Record<string, string>),
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            }
            return window.fetch(input, { ...init, headers })
          },
          signal: controller.signal,
          onopen: async (response) => {
            if (!response.ok) {
              const err = new Error(`SSE connection failed: ${response.status}`)
              ;(err as Error & { status?: number }).status = response.status
              throw err
            }
            // reconnected: status may have changed while offline
            await refresh()
          },
          onmessage: () => {
            refresh()
          },
          onerror: (err) => {
            const status = (err as Error & { status?: number }).status
            if (status === 401) {
              refreshAccessToken().catch(() => {
                sessionStorage.removeItem('accessToken')
                sessionStorage.removeItem('refreshToken')
                window.location.href = '/login'
              })
            }
            return 2000
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
        subscription: status?.subscription ?? null,
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
