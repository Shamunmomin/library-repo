import { useTheme } from '../../hooks/useTheme';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  const { colors } = useTheme();

  return (
    <div className={`flex flex-col items-center justify-center py-12 ${colors.text.tertiary}`}>
      {icon && <div className="mb-4 text-gray-400">{icon}</div>}
      <h3 className={`text-lg font-medium ${colors.text.primary}`}>{title}</h3>
      <p className={`mt-1 text-sm ${colors.text.secondary}`}>{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
