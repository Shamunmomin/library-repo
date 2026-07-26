import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { subscriptionApi } from '../../api/subscription';
import type { PaymentRequest } from '../../types/subscription';
import { Badge } from '../ui/Badge';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { EmptyState } from '../ui/EmptyState';
import { useTheme } from '../../hooks/useTheme';

export function PaymentHistory() {
  const { colors } = useTheme();
  const [payments, setPayments] = useState<PaymentRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await subscriptionApi.getPaymentHistory();
        setPayments(response.data);
      } catch {
        toast.error('Failed to fetch payment history');
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  if (loading) return <LoadingSpinner />;

  if (payments.length === 0) {
    return (
      <EmptyState
        title="No payments yet"
        description="Your payment history will appear here after you make your first payment."
      />
    );
  }

  const statusVariant = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'success';
      case 'REJECTED': return 'danger';
      case 'PENDING': return 'warning';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-3">
      {payments.map((payment) => (
        <div
          key={payment.id}
          className={`${colors.card.bg} ${colors.card.shadow} rounded-lg p-4 border ${colors.border.primary}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h4 className={`font-medium ${colors.text.primary}`}>{payment.planName}</h4>
                <Badge variant={statusVariant(payment.status)}>{payment.status}</Badge>
              </div>
              <p className={`text-sm ${colors.text.secondary} mt-1`}>
                ₹{payment.amount} | {new Date(payment.createdAt).toLocaleDateString()}
              </p>
              {payment.adminNotes && (
                <p className={`text-xs ${colors.text.tertiary} mt-1`}>
                  Note: {payment.adminNotes}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
