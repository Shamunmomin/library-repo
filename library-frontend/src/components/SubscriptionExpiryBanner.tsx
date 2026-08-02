import { useEffect, useState } from 'react'
import { useOnboarding } from '../context/OnboardingContext'

export default function SubscriptionExpiryBanner() {
 const { subscription } = useOnboarding();

const [remaining, setRemaining] = useState<{
  days: number;
  hours: number;
  expired: boolean;
} | null>(null);

const endDate = subscription?.endDate ?? null;

useEffect(() => {
  if (!endDate) {
    setRemaining(null);
    return;
  }

  const updateRemaining = () => {
    const diff = new Date(endDate).getTime() - Date.now();

    if (diff <= 0) {
      setRemaining({
        days: 0,
        hours: 0,
        expired: true,
      });
      return;
    }

    setRemaining({
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      ),
      expired: false,
    });
  };

  updateRemaining();

  const interval = setInterval(updateRemaining, 60 * 1000); // Update every minute

  return () => clearInterval(interval);
}, [endDate]);

if (
  !subscription ||
  subscription.status !== "ACTIVE" ||
  remaining === null
) {
  return null;
}

if (!remaining.expired && remaining.days > 7) {
  return null;
}

return (
  <div className="mb-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg px-4 py-3 flex items-center justify-between gap-4">
    <p className="text-sm text-amber-800 dark:text-amber-200">
      {remaining.expired
        ? "Your subscription has ended. It will be renewed only after your payment is verified."
        : `Your subscription expires in ${remaining.days} day${
            remaining.days === 1 ? "" : "s"
          } ${remaining.hours} hour${
            remaining.hours === 1 ? "" : "s"
          }. Renew before it ends to avoid interruption.`}
    </p>

    <span className="text-xs text-amber-600 dark:text-amber-400 whitespace-nowrap">
      Expires {endDate ? new Date(endDate).toLocaleDateString() : '—'}
    </span>
  </div>
);
}
