import { useState, useEffect } from 'react';
import { Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { paymentsApi } from '../../api/payments';
import type { PaymentRequest } from '../../types/subscription';
import { Badge } from '../ui/Badge';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { EmptyState } from '../ui/EmptyState';
import { PaymentDetailModal } from './PaymentDetailModal';
import { useTheme } from '../../hooks/useTheme';

export function AllPayments() {
  const { colors } = useTheme();
  const [payments, setPayments] = useState<PaymentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<PaymentRequest | null>(null);
  const [filter, setFilter] = useState<string>('ALL');

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await paymentsApi.getAllPayments();
        setPayments(response.data);
      } catch {
        toast.error('Failed to fetch payments');
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  const filteredPayments = filter === 'ALL'
    ? payments
    : payments.filter((p) => p.status === filter);

  const statusVariant = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'success';
      case 'REJECTED': return 'danger';
      case 'PENDING': return 'warning';
      default: return 'default';
    }
  };

  if (loading) return <LoadingSpinner />;

  if (payments.length === 0) {
    return (
      <EmptyState
        title="No payments yet"
        description="No payment requests have been submitted."
      />
    );
  }

  return (
    <>
      <div className="mb-4 flex gap-2">
        {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-3 py-1.5 text-sm font-medium rounded-md ${
              filter === status
                ? 'bg-blue-600 text-white'
                : `${colors.bg.tertiary} ${colors.text.secondary} ${colors.dropdown.hover}`
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      <div className={`${colors.card.bg} ${colors.card.shadow} rounded-lg border ${colors.border.primary} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className={colors.bg.tertiary}>
              <tr>
                <th className={`px-4 py-3 text-left text-xs font-medium ${colors.text.tertiary} uppercase`}>Library</th>
                <th className={`px-4 py-3 text-left text-xs font-medium ${colors.text.tertiary} uppercase`}>Owner</th>
                <th className={`px-4 py-3 text-left text-xs font-medium ${colors.text.tertiary} uppercase`}>Plan</th>
                <th className={`px-4 py-3 text-left text-xs font-medium ${colors.text.tertiary} uppercase`}>Amount</th>
                <th className={`px-4 py-3 text-left text-xs font-medium ${colors.text.tertiary} uppercase`}>Status</th>
                <th className={`px-4 py-3 text-left text-xs font-medium ${colors.text.tertiary} uppercase`}>Date</th>
                <th className={`px-4 py-3 text-left text-xs font-medium ${colors.text.tertiary} uppercase`}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className={colors.dropdown.hover}>
                  <td className={`px-4 py-3 text-sm ${colors.text.primary}`}>{payment.libraryName}</td>
                  <td className={`px-4 py-3 text-sm ${colors.text.secondary}`}>{payment.userName}</td>
                  <td className={`px-4 py-3 text-sm ${colors.text.secondary}`}>{payment.planName}</td>
                  <td className={`px-4 py-3 text-sm ${colors.text.secondary}`}>₹{payment.amount}</td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant(payment.status)}>{payment.status}</Badge>
                  </td>
                  <td className={`px-4 py-3 text-sm ${colors.text.tertiary}`}>
                    {new Date(payment.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setSelectedPayment(payment)}
                      className={`p-1.5 rounded-md ${colors.text.tertiary} ${colors.dropdown.hover}`}
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedPayment && (
        <PaymentDetailModal
          payment={selectedPayment}
          onClose={() => setSelectedPayment(null)}
          onApprove={async (id) => {
            await paymentsApi.approvePayment(id);
            setPayments((prev) =>
              prev.map((p) => (p.id === id ? { ...p, status: 'APPROVED' as const } : p))
            );
            toast.success('Payment approved');
            setSelectedPayment(null);
          }}
          onReject={async (id, notes) => {
            await paymentsApi.rejectPayment(id, { adminNotes: notes });
            setPayments((prev) =>
              prev.map((p) => (p.id === id ? { ...p, status: 'REJECTED' as const, adminNotes: notes } : p))
            );
            toast.success('Payment rejected');
            setSelectedPayment(null);
          }}
        />
      )}
    </>
  );
}
