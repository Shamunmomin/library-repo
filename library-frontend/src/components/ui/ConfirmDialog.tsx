import { Modal } from './Modal';
import { useTheme } from '../../hooks/useTheme';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'default';
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  isLoading = false,
}: ConfirmDialogProps) {
  const { colors } = useTheme();

  const confirmButtonClass =
    variant === 'danger'
      ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
      : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      <p className={`${colors.text.secondary} mb-6`}>{message}</p>
      <div className="flex justify-end gap-3">
        <button
          onClick={onClose}
          disabled={isLoading}
          className={`px-4 py-2 text-sm font-medium rounded-md ${colors.text.secondary} ${colors.bg.tertiary} ${colors.dropdown.hover} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50`}
        >
          {cancelText}
        </button>
        <button
          onClick={onConfirm}
          disabled={isLoading}
          className={`px-4 py-2 text-sm font-medium text-white rounded-md ${confirmButtonClass} focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50`}
        >
          {isLoading ? 'Processing...' : confirmText}
        </button>
      </div>
    </Modal>
  );
}
