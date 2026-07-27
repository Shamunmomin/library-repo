import { useState, useEffect } from 'react';
import { CreditCard, Building2, Clock, CheckCircle } from 'lucide-react';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';
import { useTheme } from '../../hooks/useTheme';
import { paymentsApi } from '../../services/paymentService';
import { libraryApi } from '../../services/libraryService';
import { PendingPayments } from '../../components/admin/PendingPayments';
import { AllPayments } from '../../components/admin/AllPayments';
import { LibraryList } from '../../components/admin/LibraryList';

type Tab = 'pending' | 'all' | 'libraries';

export function AdminDashboard() {
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState<Tab>('pending');
  const [stats, setStats] = useState({ pending: 0, totalPayments: 0, libraries: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [pendingRes, allRes, libRes] = await Promise.all([
          paymentsApi.getPendingPayments(),
          paymentsApi.getAllPayments(),
          libraryApi.getAllLibraries(),
        ]);
        setStats({
          pending: pendingRes.data.length,
          totalPayments: allRes.data.length,
          libraries: libRes.data.length,
        });
      } catch {
        // Stats are non-critical
      }
    };
    fetchStats();
  }, []);

  const tabs: { id: Tab; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: 'pending', label: 'Pending Payments', icon: <Clock size={18} />, count: stats.pending },
    { id: 'all', label: 'All Payments', icon: <CreditCard size={18} />, count: stats.totalPayments },
    { id: 'libraries', label: 'Libraries', icon: <Building2 size={18} />, count: stats.libraries },
  ];

  return (
    <div className={`min-h-screen ${colors.bg.secondary} flex flex-col`}>
      <Header />
      <main className="flex-1 max-w-7xl mx-auto w-full py-6 px-4 sm:px-6 lg:px-8">
        <h2 className={`text-2xl font-bold ${colors.text.primary}`}>Admin Dashboard</h2>
        <p className={`mt-1 ${colors.text.secondary}`}>Manage libraries, payments, and subscriptions.</p>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <div className={`${colors.card.bg} ${colors.card.shadow} rounded-lg p-4 border ${colors.border.primary}`}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <Clock size={20} className="text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className={`text-2xl font-bold ${colors.text.primary}`}>{stats.pending}</p>
                <p className={`text-xs ${colors.text.tertiary}`}>Pending Payments</p>
              </div>
            </div>
          </div>
          <div className={`${colors.card.bg} ${colors.card.shadow} rounded-lg p-4 border ${colors.border.primary}`}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CheckCircle size={20} className="text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className={`text-2xl font-bold ${colors.text.primary}`}>{stats.totalPayments}</p>
                <p className={`text-xs ${colors.text.tertiary}`}>Total Payments</p>
              </div>
            </div>
          </div>
          <div className={`${colors.card.bg} ${colors.card.shadow} rounded-lg p-4 border ${colors.border.primary}`}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Building2 size={20} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className={`text-2xl font-bold ${colors.text.primary}`}>{stats.libraries}</p>
                <p className={`text-xs ${colors.text.tertiary}`}>Total Libraries</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-6">
          <div className={`flex gap-1 p-1 ${colors.bg.tertiary} rounded-lg`}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === tab.id
                    ? `${colors.card.bg} ${colors.text.primary} shadow-sm`
                    : `${colors.text.secondary} ${colors.dropdown.hover}`
                }`}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="px-1.5 py-0.5 text-xs bg-blue-600 text-white rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="mt-4">
            {activeTab === 'pending' && <PendingPayments />}
            {activeTab === 'all' && <AllPayments />}
            {activeTab === 'libraries' && <LibraryList />}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
