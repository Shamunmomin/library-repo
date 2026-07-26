import { useTheme } from '../../hooks/useTheme';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
}

const variantStyles = {
  default: { light: 'bg-gray-100 text-gray-800', dark: 'bg-gray-700 text-gray-200' },
  success: { light: 'bg-green-100 text-green-800', dark: 'bg-green-900/50 text-green-200' },
  warning: { light: 'bg-yellow-100 text-yellow-800', dark: 'bg-yellow-900/50 text-yellow-200' },
  danger: { light: 'bg-red-100 text-red-800', dark: 'bg-red-900/50 text-red-200' },
  info: { light: 'bg-blue-100 text-blue-800', dark: 'bg-blue-900/50 text-blue-200' },
};

export function Badge({ children, variant = 'default', size = 'sm' }: BadgeProps) {
  const { mode } = useTheme();
  const style = variantStyles[variant];
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  return (
    <span className={`inline-flex items-center font-medium rounded-full ${sizeClass} ${mode === 'dark' ? style.dark : style.light}`}>
      {children}
    </span>
  );
}
