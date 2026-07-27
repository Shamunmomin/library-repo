import { useState, useEffect } from 'react';
import { CreditCard, History, Building2 } from 'lucide-react';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import { libraryApi } from '../../api/library';
import { subscriptionApi } from '../../api/subscription';
import { SubscriptionStatusCard } from '../../components/owner/SubscriptionStatus';
import { SubscriptionPlans } from '../../components/owner/SubscriptionPlans';
import { PaymentHistory } from '../../components/owner/PaymentHistory';
import { CreateLibraryForm } from '../../components/owner/CreateLibraryForm';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import type { SubscriptionStatus } from '../../types/subscription';

type PageState = 'loading' | 'choose_plan' | 'payment_pending' | 'create_library' | 'dashboard';

type Tab = 'subscription' | 'payments';

export function OwnerDashboard() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [pageState, setPageState] = useState<PageState>('loading');
  const [activeTab, setActiveTab] = useState<Tab>('subscription');

  useEffect(() => {
    const fetchState = async () => {
      try {
        const [subRes, libRes] = await Promise.allSettled([
          subscriptionApi.getStatus(),
          libraryApi.getMyLibrary(),
        ]);

        let status: SubscriptionStatus | null = null;
        let libraryExists = false;

        if (subRes.status === 'fulfilled') {
          status = subRes.value.data;
        }
        if (libRes.status === 'fulfilled') {
          libraryExists = true;
        }

        if (status?.subscribed && libraryExists) {
          setPageState('dashboard');
        } else if (status?.paymentApproved && !libraryExists) {
          setPageState('create_library');
        } else if (status?.pendingPayment) {
          setPageState('payment_pending');
        } else {
          setPageState('choose_plan');
        }
      } catch {
        setPageState('choose_plan');
      }
    };
    fetchState();
  }, []);

  const handleLibraryCreated = () => {
    setPageState('dashboard');
  };

  if (pageState === 'loading') {
    return (
      <div className={`min-h-screen ${colors.bg.secondary} flex flex-col`}>
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <LoadingSpinner />
        </main>
      </div>
    );
  }

  // ── PAYMENT APPROVED → Create Library ──
  if (pageState === 'create_library') {
    return (
      <div className={`min-h-screen ${colors.bg.secondary} flex flex-col`}>
        <Header />
        <main className="flex-1 max-w-7xl mx-auto w-full py-6 px-4 sm:px-6 lg:px-8">
          <h2 className={`text-2xl font-bold ${colors.text.primary}`}>Owner Dashboard</h2>
          <p className={`mt-1 ${colors.text.secondary}`}>
            Welcome back, {user?.name}. Your payment has been approved!
          </p>

          <div className="mt-6">
            <SubscriptionStatusCard />
          </div>

          <div className="mt-8 max-w-lg">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center justify-center w-7 h-7 rounded-full bg-green-600 text-white text-xs font-bold">
                <Building2 size={16} />
              </div>
              <span className={`text-lg font-semibold ${colors.text.primary}`}>
                Create Your Library
              </span>
            </div>
            <p className={`text-sm ${colors.text.secondary} mb-4`}>
              Your payment is approved! Please set up your library to activate your subscription.
            </p>
            <CreateLibraryForm onSuccess={handleLibraryCreated} />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ── PAYMENT PENDING ──
  if (pageState === 'payment_pending') {
    return (
      <div className={`min-h-screen ${colors.bg.secondary} flex flex-col`}>
        <Header />
        <main className="flex-1 max-w-7xl mx-auto w-full py-6 px-4 sm:px-6 lg:px-8">
          <h2 className={`text-2xl font-bold ${colors.text.primary}`}>Owner Dashboard</h2>
          <p className={`mt-1 ${colors.text.secondary}`}>
            Welcome back, {user?.name}. Your payment is being reviewed by the admin.
          </p>

          <div className="mt-6">
            <SubscriptionStatusCard />
          </div>

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
              {activeTab === 'payments' && <PaymentHistory />}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ── CHOOSE PLAN (no subscription) ──
  if (pageState === 'choose_plan') {
    return (
      <div className={`min-h-screen ${colors.bg.secondary} flex flex-col`}>
        <Header />
        <main className="flex-1 max-w-7xl mx-auto w-full py-6 px-4 sm:px-6 lg:px-8">
          <h2 className={`text-2xl font-bold ${colors.text.primary}`}>Owner Dashboard</h2>
          <p className={`mt-1 ${colors.text.secondary}`}>
            Welcome back, {user?.name}. Subscribe to a plan to get started.
          </p>

          <div className="mt-6">
            <SubscriptionStatusCard />
          </div>

          <div className="mt-6">
            <SubscriptionPlans />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ── FULL DASHBOARD (subscribed + library exists) ──
  return (
    <div className={`min-h-screen ${colors.bg.secondary} flex flex-col`}>
      <Header />
      <main className="flex-1 max-w-7xl mx-auto w-full py-6 px-4 sm:px-6 lg:px-8">
        <h2 className={`text-2xl font-bold ${colors.text.primary}`}>Owner Dashboard</h2>
        <p className={`mt-1 ${colors.text.secondary}`}>
          Welcome back, {user?.name}. Manage your library and subscription.
        </p>

        <div className="mt-6">
          <SubscriptionStatusCard />
        </div>

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
      </main>
      <Footer />
    </div>
  );
}
