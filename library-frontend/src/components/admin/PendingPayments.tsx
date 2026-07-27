import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { paymentsApi } from '../../services/paymentService';
import type { PaymentRequest } from '../../types/subscription';
import { Badge } from '../ui/Badge';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { EmptyState } from '../ui/EmptyState';
import { PaymentDetailModal } from './PaymentDetailModal';
import { useTheme } from '../../hooks/useTheme';

export function PendingPayments() {
  const { colors } = useTheme();
  const [payments, setPayments] = useState<PaymentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<PaymentRequest | null>(null);

  const fetchPayments = async () => {
    try {
      const response = await paymentsApi.getPendingPayments();
      setPayments(response.data);
    } catch {
      toast.error('Failed to fetch pending payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await paymentsApi.approvePayment(id);
      toast.success('Payment approved successfully');
      setPayments((prev) => prev.filter((p) => p.id !== id));
      setSelectedPayment(null);
    } catch {
      toast.error('Failed to approve payment');
    }
  };

  const handleReject = async (id: string, notes: string) => {
    try {
      await paymentsApi.rejectPayment(id, { adminNotes: notes });
      toast.success('Payment rejected');
      setPayments((prev) => prev.filter((p) => p.id !== id));
      setSelectedPayment(null);
    } catch {
      toast.error('Failed to reject payment');
    }
  };

  if (loading) return <LoadingSpinner />;

  if (payments.length === 0) {
    return (
      <EmptyState
        title="No pending payments"
        description="There are no pending payment requests to review."
      />
    );
  }

  return (
    <>
      <div className="space-y-4">
        {payments.map((payment) => (
          <div
            key={payment.id}
            className={`${colors.card.bg} ${colors.card.shadow} rounded-lg p-4 border ${colors.border.primary}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className={`font-medium ${colors.text.primary}`}>{payment.libraryName}</h4>
                  <Badge variant="warning">Pending</Badge>
                </div>
                <p className={`text-sm ${colors.text.secondary} mt-1`}>
                  {payment.userName} | {payment.planName} | ₹{payment.amount}
                </p>
                <p className={`text-xs ${colors.text.tertiary} mt-1`}>
                  Submitted: {new Date(payment.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedPayment(payment)}
                  className={`p-2 rounded-md ${colors.text.tertiary} ${colors.dropdown.hover}`}
                  title="View Details"
                >
                  <Eye size={18} />
                </button>
                <button
                  onClick={() => handleApprove(payment.id)}
                  className="p-2 rounded-md text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                  title="Approve"
                >
                  <CheckCircle size={18} />
                </button>
                <button
                  onClick={() => setSelectedPayment(payment)}
                  className="p-2 rounded-md text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  title="Reject"
                >
                  <XCircle size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedPayment && (
        <PaymentDetailModal
          payment={selectedPayment}
          onClose={() => setSelectedPayment(null)}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}
    </>
  );
}
