import { useState, useEffect } from 'react';
import { OwnerPageLayout } from '../../components/shared/OwnerPageLayout';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { subscriptionApi } from '../../services/subscriptionService';
import { libraryApi } from '../../services/libraryService';
import type { SubscriptionStatus } from '../../types/subscription';
import { ChoosePlanPage } from './ChoosePlanPage';
import { PaymentPendingPage } from './PaymentPendingPage';
import { CreateLibraryPage } from './CreateLibraryPage';
import { DashboardHome } from './DashboardHome';

type PageState = 'loading' | 'choose_plan' | 'payment_pending' | 'create_library' | 'dashboard';

export function OwnerDashboard() {
  const [pageState, setPageState] = useState<PageState>('loading');

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

  if (pageState === 'loading') {
    return (
      <OwnerPageLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <LoadingSpinner />
        </div>
      </OwnerPageLayout>
    );
  }

  if (pageState === 'choose_plan') return <ChoosePlanPage />;
  if (pageState === 'payment_pending') return <PaymentPendingPage />;
  if (pageState === 'create_library') return <CreateLibraryPage onLibraryCreated={() => setPageState('dashboard')} />;

  return <DashboardHome />;
}
