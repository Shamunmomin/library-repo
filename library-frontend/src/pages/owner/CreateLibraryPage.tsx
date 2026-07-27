import { Building2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { OwnerPageLayout } from '../../components/shared/OwnerPageLayout';
import { SubscriptionStatusCard } from '../../components/owner/SubscriptionStatus';
import { CreateLibraryForm } from '../../components/owner/CreateLibraryForm';

interface CreateLibraryPageProps {
  onLibraryCreated: () => void;
}

export function CreateLibraryPage({ onLibraryCreated }: CreateLibraryPageProps) {
  const { user } = useAuth();

  return (
    <OwnerPageLayout>
      <h2 className={`text-2xl font-bold`}>Owner Dashboard</h2>
      <p className={`mt-1`}>
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
          <span className={`text-lg font-semibold`}>
            Create Your Library
          </span>
        </div>
        <p className={`text-sm mb-4`}>
          Your payment is approved! Please set up your library to activate your subscription.
        </p>
        <CreateLibraryForm onSuccess={onLibraryCreated} />
      </div>
    </OwnerPageLayout>
  );
}
