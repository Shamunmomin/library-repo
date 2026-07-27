import { CreditCard, History } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

export type TabId = 'subscription' | 'payments';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

interface TabBarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  tabs?: Tab[];
}

const defaultTabs: Tab[] = [
  { id: 'subscription', label: 'Subscription Plans', icon: <CreditCard size={18} /> },
  { id: 'payments', label: 'Payment History', icon: <History size={18} /> },
];

export function TabBar({ activeTab, onTabChange, tabs = defaultTabs }: TabBarProps) {
  const { colors } = useTheme();

  return (
    <div className={`flex gap-1 p-1 ${colors.bg.tertiary} rounded-lg`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === tab.id
              ? `${colors.card.bg} ${colors.text.primary} shadow-sm`
              : `${colors.text.secondary} ${colors.dropdown.hover}`
          }`}
        >
          {tab.icon}
          <span className="hidden sm:inline">{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
