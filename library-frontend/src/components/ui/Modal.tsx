import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxWidth?: string;
}

export function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }: ModalProps) {
  const { colors } = useTheme();
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className={`${colors.bg.primary} rounded-lg shadow-xl w-full ${maxWidth} max-h-[90vh] overflow-hidden`}>
        <div className={`flex items-center justify-between px-6 py-4 border-b ${colors.border.primary}`}>
          <h3 className={`text-lg font-semibold ${colors.text.primary}`}>{title}</h3>
          <button
            onClick={onClose}
            className={`p-1 rounded-md ${colors.text.tertiary} ${colors.dropdown.hover}`}
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-8rem)]">{children}</div>
      </div>
    </div>
  );
}
