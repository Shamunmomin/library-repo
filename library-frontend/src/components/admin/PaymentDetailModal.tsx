import { useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { useTheme } from '../../hooks/useTheme';
import type { PaymentRequest } from '../../types/subscription';

interface PaymentDetailModalProps {
  payment: PaymentRequest;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string, notes: string) => void;
}

export function PaymentDetailModal({ payment, onClose, onApprove, onReject }: PaymentDetailModalProps) {
  const { colors } = useTheme();
  const [rejectNotes, setRejectNotes] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:8080';
  const screenshotUrl = payment.screenshotPath
    ? `${baseUrl}/${payment.screenshotPath}`
    : null;

  const statusVariant = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'success';
      case 'REJECTED': return 'danger';
      case 'PENDING': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Payment Details" maxWidth="max-w-2xl">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className={`text-xs ${colors.text.tertiary}`}>Library</p>
            <p className={`text-sm font-medium ${colors.text.primary}`}>{payment.libraryName}</p>
          </div>
          <div>
            <p className={`text-xs ${colors.text.tertiary}`}>Owner</p>
            <p className={`text-sm font-medium ${colors.text.primary}`}>{payment.userName}</p>
          </div>
          <div>
            <p className={`text-xs ${colors.text.tertiary}`}>Plan</p>
            <p className={`text-sm font-medium ${colors.text.primary}`}>{payment.planName}</p>
          </div>
          <div>
            <p className={`text-xs ${colors.text.tertiary}`}>Amount</p>
            <p className={`text-sm font-medium ${colors.text.primary}`}>₹{payment.amount}</p>
          </div>
          <div>
            <p className={`text-xs ${colors.text.tertiary}`}>Status</p>
            <Badge variant={statusVariant(payment.status)}>{payment.status}</Badge>
          </div>
          <div>
            <p className={`text-xs ${colors.text.tertiary}`}>Submitted</p>
            <p className={`text-sm ${colors.text.primary}`}>
              {new Date(payment.createdAt).toLocaleString()}
            </p>
          </div>
        </div>

        {payment.adminNotes && (
          <div className={`p-3 rounded-md ${colors.bg.tertiary}`}>
            <p className={`text-xs ${colors.text.tertiary}`}>Admin Notes</p>
            <p className={`text-sm ${colors.text.primary}`}>{payment.adminNotes}</p>
          </div>
        )}

        {screenshotUrl && (
          <div>
            <p className={`text-xs ${colors.text.tertiary} mb-2`}>Payment Screenshot</p>
            <div className={`rounded-md overflow-hidden border ${colors.border.primary}`}>
              <img
                src={screenshotUrl}
                alt="Payment Screenshot"
                className="w-full max-h-64 object-contain bg-gray-100 dark:bg-gray-900"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          </div>
        )}

        {showRejectForm ? (
          <div className="space-y-3">
            <textarea
              value={rejectNotes}
              onChange={(e) => setRejectNotes(e.target.value)}
              placeholder="Reason for rejection (optional)"
              rows={3}
              className={`w-full px-3 py-2 border ${colors.input.border} ${colors.input.bg} ${colors.text.primary} rounded-md shadow-sm ${colors.input.placeholder} focus:outline-none ${colors.input.focus} text-sm`}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowRejectForm(false);
                  setRejectNotes('');
                }}
                className={`px-3 py-1.5 text-sm rounded-md ${colors.text.secondary} ${colors.bg.tertiary} ${colors.dropdown.hover}`}
              >
                Cancel
              </button>
              <button
                onClick={() => onReject(payment.id, rejectNotes)}
                className="px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        ) : (
          payment.status === 'PENDING' && (
            <div className="flex justify-end gap-2 pt-2 border-t ${colors.border.primary}">
              <button
                onClick={() => setShowRejectForm(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 border border-red-300 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <XCircle size={16} />
                Reject
              </button>
              <button
                onClick={() => onApprove(payment.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
              >
                <CheckCircle size={16} />
                Approve
              </button>
            </div>
          )
        )}
      </div>
    </Modal>
  );
}
