import { useTheme } from '../../hooks/useTheme';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingSpinner({ size = 'md' }: LoadingSpinnerProps) {
  const { colors } = useTheme();
  const sizeClass = {
    sm: 'h-6 w-6',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  }[size];

  return (
    <div className="flex items-center justify-center py-8">
      <div className={`animate-spin rounded-full ${sizeClass} border-b-2 ${colors.spinner}`}></div>
    </div>
  );
}
