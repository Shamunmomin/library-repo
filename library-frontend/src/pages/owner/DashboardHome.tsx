import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { OwnerPageLayout } from '../../components/shared/OwnerPageLayout';
import { TabBar, type TabId } from '../../components/shared/TabBar';
import { SubscriptionStatusCard } from '../../components/owner/SubscriptionStatus';
import { SubscriptionPlans } from '../../components/owner/SubscriptionPlans';
import { PaymentHistory } from '../../components/owner/PaymentHistory';

export function DashboardHome() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>('subscription');

  return (
    <OwnerPageLayout>
      <h2 className={`text-2xl font-bold`}>Owner Dashboard</h2>
      <p className={`mt-1`}>
        Welcome back, {user?.name}. Manage your library and subscription.
      </p>

      <div className="mt-6">
        <SubscriptionStatusCard />
      </div>

      <div className="mt-6">
        <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="mt-4">
          {activeTab === 'subscription' && <SubscriptionPlans />}
          {activeTab === 'payments' && <PaymentHistory />}
        </div>
      </div>
    </OwnerPageLayout>
  );
}
