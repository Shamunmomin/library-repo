import { useAuth } from '../../hooks/useAuth';
import { OwnerPageLayout } from '../../components/shared/OwnerPageLayout';
import { SubscriptionStatusCard } from '../../components/owner/SubscriptionStatus';
import { SubscriptionPlans } from '../../components/owner/SubscriptionPlans';

export function ChoosePlanPage() {
  const { user } = useAuth();

  return (
    <OwnerPageLayout>
      <h2 className={`text-2xl font-bold`}>Subscription Plans</h2>
      <p className={`mt-1`}>
        Welcome back, {user?.name}. Subscribe to a plan to get started.
      </p>

      <div className="mt-6">
        <SubscriptionStatusCard />
      </div>

      <div className="mt-6">
        <SubscriptionPlans />
      </div>
    </OwnerPageLayout>
  );
}
