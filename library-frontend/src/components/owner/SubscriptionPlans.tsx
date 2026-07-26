import { useState, useEffect } from 'react';
import { Upload, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { subscriptionApi } from '../../api/subscription';
import type { SubscriptionPlan } from '../../types/subscription';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { useTheme } from '../../hooks/useTheme';

export function SubscriptionPlans() {
  const { colors } = useTheme();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [adminPhone, setAdminPhone] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [plansRes, phoneRes] = await Promise.all([
          subscriptionApi.getPlans(),
          subscriptionApi.getAdminPhone(),
        ]);
        setPlans(plansRes.data);
        setAdminPhone(phoneRes.data);
      } catch {
        toast.error('Failed to load plans');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async () => {
    if (!selectedPlan || !screenshot) {
      toast.error('Please select a plan and upload payment screenshot');
      return;
    }

    setIsSubmitting(true);
    try {
      await subscriptionApi.submitPayment(selectedPlan.id, screenshot);
      toast.success('Payment submitted! Waiting for admin approval.');
      setSelectedPlan(null);
      setScreenshot(null);
    } catch {
      // Error handled by interceptor
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* Admin Phone */}
      {adminPhone && (
        <div className={`${colors.card.bg} ${colors.card.shadow} rounded-lg p-4 border border-blue-300 dark:border-blue-700`}>
          <p className={`text-sm ${colors.text.secondary}`}>
            Send payment to: <span className={`font-medium ${colors.text.primary}`}>{adminPhone}</span>
          </p>
        </div>
      )}

      {/* Plan Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {plans.map((plan) => (
          <div
            key={plan.id}
            onClick={() => setSelectedPlan(plan)}
            className={`${colors.card.bg} ${colors.card.shadow} rounded-lg p-5 border-2 cursor-pointer transition-all ${
              selectedPlan?.id === plan.id
                ? 'border-blue-500 ring-2 ring-blue-500/20'
                : `border-transparent ${colors.border.primary}`
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className={`text-lg font-semibold ${colors.text.primary}`}>{plan.name}</h4>
              {selectedPlan?.id === plan.id && (
                <Check size={20} className="text-blue-600" />
              )}
            </div>
            <p className={`text-2xl font-bold ${colors.text.primary} mb-2`}>₹{plan.price}<span className={`text-sm font-normal ${colors.text.tertiary}`}>/mo</span></p>
            <p className={`text-sm ${colors.text.secondary} mb-4`}>{plan.description}</p>
            <div className={`text-xs ${colors.text.tertiary} space-y-1`}>
              <p>Up to {plan.maxFloors} floor{plan.maxFloors > 1 ? 's' : ''}</p>
              <p>Up to {plan.maxSeats} seats</p>
              <p>Up to {plan.maxMembers} members</p>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Section */}
      {selectedPlan && (
        <div className={`${colors.card.bg} ${colors.card.shadow} rounded-lg p-5 border ${colors.border.primary}`}>
          <h4 className={`font-medium ${colors.text.primary} mb-3`}>Upload Payment Screenshot</h4>
          <div className="space-y-4">
            <div>
              <label className={`block text-sm ${colors.text.secondary} mb-2`}>
                Take a screenshot of your payment and upload it here
              </label>
              <div className={`flex items-center gap-3 p-3 border-2 border-dashed ${colors.border.primary} rounded-lg`}>
                <Upload size={20} className={colors.text.tertiary} />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setScreenshot(e.target.files?.[0] || null)}
                  className={`text-sm ${colors.text.secondary}`}
                />
              </div>
              {screenshot && (
                <p className={`text-xs ${colors.text.tertiary} mt-1`}>Selected: {screenshot.name}</p>
              )}
            </div>
            <button
              onClick={handleSubmit}
              disabled={!screenshot || isSubmitting}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Payment'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
