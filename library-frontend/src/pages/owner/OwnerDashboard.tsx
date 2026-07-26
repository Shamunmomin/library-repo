import { useState, useEffect } from 'react';
import { CreditCard, Building2, History } from 'lucide-react';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import { libraryApi } from '../../api/library';
import { SubscriptionStatusCard } from '../../components/owner/SubscriptionStatus';
import { CreateLibraryForm } from '../../components/owner/CreateLibraryForm';
import { SubscriptionPlans } from '../../components/owner/SubscriptionPlans';
import { PaymentHistory } from '../../components/owner/PaymentHistory';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

type Tab = 'subscription' | 'payments';

export function OwnerDashboard() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [hasLibrary, setHasLibrary] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('subscription');

  const checkLibrary = async () => {
    try {
      await libraryApi.getMyLibrary();
      setHasLibrary(true);
    } catch {
      setHasLibrary(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkLibrary();
  }, []);

  if (loading) {
    return (
      <div className={`min-h-screen ${colors.bg.secondary} flex flex-col`}>
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <LoadingSpinner />
        </main>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${colors.bg.secondary} flex flex-col`}>
      <Header />
      <main className="flex-1 max-w-7xl mx-auto w-full py-6 px-4 sm:px-6 lg:px-8">
        <h2 className={`text-2xl font-bold ${colors.text.primary}`}>Owner Dashboard</h2>
        <p className={`mt-1 ${colors.text.secondary}`}>
          Welcome back, {user?.name}. Manage your library and subscription.
        </p>

        {!hasLibrary ? (
          <div className="mt-6 max-w-lg">
            <CreateLibraryForm onSuccess={() => setHasLibrary(true)} />
          </div>
        ) : (
          <>
            {/* Subscription Status */}
            <div className="mt-6">
              <SubscriptionStatusCard />
            </div>

            {/* Tabs */}
            <div className="mt-6">
              <div className={`flex gap-1 p-1 ${colors.bg.tertiary} rounded-lg`}>
                <button
                  onClick={() => setActiveTab('subscription')}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === 'subscription'
                      ? `${colors.card.bg} ${colors.text.primary} shadow-sm`
                      : `${colors.text.secondary} ${colors.dropdown.hover}`
                  }`}
                >
                  <CreditCard size={18} />
                  <span className="hidden sm:inline">Subscription Plans</span>
                </button>
                <button
                  onClick={() => setActiveTab('payments')}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === 'payments'
                      ? `${colors.card.bg} ${colors.text.primary} shadow-sm`
                      : `${colors.text.secondary} ${colors.dropdown.hover}`
                  }`}
                >
                  <History size={18} />
                  <span className="hidden sm:inline">Payment History</span>
                </button>
              </div>

              <div className="mt-4">
                {activeTab === 'subscription' && <SubscriptionPlans />}
                {activeTab === 'payments' && <PaymentHistory />}
              </div>
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
