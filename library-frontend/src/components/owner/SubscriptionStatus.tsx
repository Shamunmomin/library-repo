import { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { subscriptionApi } from '../../api/subscription';
import type { SubscriptionStatus } from '../../types/subscription';
import { Badge } from '../ui/Badge';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { useTheme } from '../../hooks/useTheme';

export function SubscriptionStatusCard() {
  const { colors } = useTheme();
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await subscriptionApi.getStatus();
        setStatus(response.data);
      } catch {
        toast.error('Failed to fetch subscription status');
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, []);

  if (loading) return <LoadingSpinner size="sm" />;

  if (!status) return null;

  if (status.pendingPayment) {
    return (
      <div className={`${colors.card.bg} ${colors.card.shadow} rounded-lg p-4 border border-yellow-300 dark:border-yellow-700`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
            <Clock size={20} className="text-yellow-600 dark:text-yellow-400" />
          </div>
          <div>
            <h4 className={`font-medium ${colors.text.primary}`}>Payment Pending</h4>
            <p className={`text-sm ${colors.text.secondary}`}>
              Your payment request is being reviewed by admin.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!status.subscribed) {
    return (
      <div className={`${colors.card.bg} ${colors.card.shadow} rounded-lg p-4 border border-gray-300 dark:border-gray-600`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <AlertCircle size={20} className="text-gray-500" />
          </div>
          <div>
            <h4 className={`font-medium ${colors.text.primary}`}>No Active Subscription</h4>
            <p className={`text-sm ${colors.text.secondary}`}>
              Subscribe to a plan to start managing your library.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${colors.card.bg} ${colors.card.shadow} rounded-lg p-4 border border-green-300 dark:border-green-700`}>
      <div className="flex items-center gap-3">
        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
          <CheckCircle size={20} className="text-green-600 dark:text-green-400" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className={`font-medium ${colors.text.primary}`}>{status.planName}</h4>
            <Badge variant="success">Active</Badge>
          </div>
          <p className={`text-sm ${colors.text.secondary}`}>
            Valid until {status.endDate ? new Date(status.endDate).toLocaleDateString() : 'N/A'}
          </p>
        </div>
      </div>
    </div>
  );
}
