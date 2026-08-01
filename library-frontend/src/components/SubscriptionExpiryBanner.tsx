import { useEffect, useState } from 'react'
import { useOnboarding } from '../context/OnboardingContext'

export default function SubscriptionExpiryBanner() {
  const { subscription } = useOnboarding()
  const [daysLeft, setDaysLeft] = useState<number | null>(null)

  const endDate = subscription?.endDate ?? null

  useEffect(() => {
    if (!endDate) {
      const id = setTimeout(() => setDaysLeft(null), 0)
      return () => clearTimeout(id)
    }
    const timer = setTimeout(() => {
      setDaysLeft(Math.ceil((new Date(endDate).getTime() - Date.now()) / 86_400_000))
    }, 0)
    return () => clearTimeout(timer)
  }, [endDate])

  if (!subscription || subscription.status !== 'ACTIVE' || daysLeft === null) {
    return null
  }

  if (daysLeft > 7) return null

  return (
    <div className="mb-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg px-4 py-3 flex items-center justify-between gap-4">
      <p className="text-sm text-amber-800 dark:text-amber-200">
        {daysLeft <= 0
          ? 'Your subscription has ended. It will be renewed only after your payment is verified.'
          : `Your subscription expires in ${daysLeft} day${daysLeft === 1 ? '' : 's'}. Renew before it ends to avoid interruption.`}
      </p>
      <span className="text-xs text-amber-600 dark:text-amber-400 whitespace-nowrap">
        Expires {new Date(endDate as string).toLocaleDateString()}
      </span>
    </div>
  )
}
