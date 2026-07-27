import { useState, useEffect } from 'react';
import { Upload, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { subscriptionApi } from '../../api/subscriptionService';
import type { SubscriptionPlan } from '../../types/subscription';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { UpiQrCode } from './UpiQrCode';
import { useTheme } from '../../hooks/useTheme';

export function SubscriptionPlans() {
  const { colors } = useTheme();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [adminPhone, setAdminPhone] = useState('');
  const [upiId, setUpiId] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [plansRes, phoneRes, upiRes] = await Promise.all([
          subscriptionApi.getPlans(),
          subscriptionApi.getAdminPhone(),
          subscriptionApi.getAdminUpiId(),
        ]);
        setPlans(plansRes.data);
        setAdminPhone(phoneRes.data);
        setUpiId(upiRes.data);
      } catch {
        toast.error('Failed to load plans');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

  const handleSubmit = async () => {
    if (!selectedPlan || !screenshot) {
      toast.error('Please select a plan and upload payment screenshot');
      return;
    }

    if (screenshot.size > MAX_FILE_SIZE) {
      toast.error('File is too large. Maximum allowed size is 5 MB.');
      return;
    }

    setIsSubmitting(true);
    try {
      await subscriptionApi.submitPayment(selectedPlan.id, screenshot);
      toast.success('Payment submitted! Waiting for admin approval.');
      setSelectedPlan(null);
      setScreenshot(null);
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Failed to submit payment. Please try again.';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-4">
      <div className={`flex items-center gap-2 ${colors.text.secondary}`}>
        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold">1</div>
        <span className="text-sm font-medium">Choose a subscription plan</span>
      </div>

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

      {/* Payment Section */}
      {selectedPlan && (
        <div className={`${colors.card.bg} ${colors.card.shadow} rounded-lg p-5 border ${colors.border.primary}`}>
          <div className={`flex items-center gap-2 mb-4`}>
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold">2</div>
            <h4 className={`font-medium ${colors.text.primary}`}>Make Payment</h4>
          </div>

          {/* UPI QR Code */}
          {upiId && (
            <div className="flex flex-col items-center mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className={`text-sm ${colors.text.secondary} mb-3`}>
                Scan QR code to pay <span className="font-semibold">₹{selectedPlan.price}</span> for <span className="font-semibold">{selectedPlan.name}</span>
              </p>
              <UpiQrCode
                upiId={upiId}
                amount={Number(selectedPlan.price)}
                name="Library Management"
              />
            </div>
          )}

          {/* Upload Screenshot */}
          <div className="space-y-4">
            <div>
              <label className={`block text-sm ${colors.text.secondary} mb-2`}>
                After payment, take a screenshot and upload it here
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
