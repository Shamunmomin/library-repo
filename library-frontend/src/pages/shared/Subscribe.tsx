import { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckIcon } from '@heroicons/react/24/solid'
import { subscriptionService } from '../../services/subscriptionService'
import { SUBSCRIPTION_PACKAGES } from '../../utils/constants'
import { useOnboarding } from '../../context/OnboardingContext'
import LoadingSpinner from '../../components/LoadingSpinner'
import scannerImg from '../../../public/scanner.jpeg';
import toast from 'react-hot-toast'

export default function Subscribe() {
  const { step, notice, loading, refresh } = useOnboarding()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner />
      </div>
    )
  }

  if (step === 'PENDING_REVIEW') {
    return <PendingApproval onRefresh={refresh} />
  }

  return <SubscribeForm notice={notice} onSubmitted={refresh} />
}

function SubscribeForm({ notice, onSubmitted }: { notice: string | null; onSubmitted: () => Promise<unknown> }) {
  const [selected, setSelected] = useState<'BASE' | 'PRO'>('BASE')
  const [screenshot, setScreenshot] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setScreenshot(file)
      setPreview(URL.createObjectURL(file))
    }
  }

  async function handleSubmit() {
    if (!screenshot) {
      toast.error('Please upload a payment screenshot')
      return
    }
    setIsSubmitting(true)
    try {
      await subscriptionService.create(selected, screenshot)
      toast.success('Subscription request submitted!')
      await onSubmitted()
      setSubmitted(true)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg || 'Failed to submit subscription')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return <PendingApproval onRefresh={onSubmitted} />
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Choose Your Plan</h1>
          <p className="text-gray-500 dark:text-gray-400">Pick the right plan for your library management needs</p>
        </div>

        {notice && (
          <div className="max-w-2xl mx-auto mb-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 text-sm text-yellow-800 dark:text-yellow-200">
            {notice}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6 mb-10">
          {(Object.entries(SUBSCRIPTION_PACKAGES) as [string, typeof SUBSCRIPTION_PACKAGES.BASE][]).map(([key, pkg]) => (
            <motion.div
              key={key}
              whileHover={{ scale: 1.02 }}
              onClick={() => setSelected(key as 'BASE' | 'PRO')}
              className={`relative rounded-2xl border-2 p-6 cursor-pointer transition-all bg-white dark:bg-gray-800
                ${selected === key
                  ? 'border-primary-500 shadow-lg shadow-primary-500/10'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }`}
            >
              {key === 'PRO' && (
                <span className="absolute -top-3 right-6 bg-gradient-to-r from-purple-600 to-pink-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  POPULAR
                </span>
              )}
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{pkg.name}</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">₹{pkg.price}</span>
                <span className="text-gray-500 dark:text-gray-400 text-sm">/month</span>
              </div>
              <ul className="space-y-2 mb-6">
                {pkg.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <CheckIcon className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <div
                className={`w-full py-2.5 rounded-lg text-center text-sm font-medium transition-colors
                  ${selected === key
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                  }`}
              >
                {selected === key ? 'Selected' : 'Select'}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">Payment</h3>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 mb-4 flex items-center justify-center">
            <div className="text-center">
              <div className="w-40 h-40 bg-white dark:bg-gray-600 rounded-lg flex items-center justify-center mx-auto mb-2 border border-gray-200 dark:border-gray-600">
                <div className="text-center">
                  <div className="text-3xl mb-1"><img src={scannerImg} alt="Scanner" /></div>
                  <div className="text-xs text-gray-500">Scan to Pay</div>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                <br /> <br />Pay ₹{selected === 'BASE' ? SUBSCRIPTION_PACKAGES.BASE.price : SUBSCRIPTION_PACKAGES.PRO.price} via UPI
              </p>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Upload Payment Screenshot <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFile}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 dark:file:bg-primary-900/30 file:text-primary-700 dark:file:text-primary-300 hover:file:bg-primary-100 cursor-pointer"
            />
            {preview && (
              <img src={preview} alt="Preview" className="mt-2 w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-600" />
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !screenshot}
            className="w-full py-2.5 px-4 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Payment Proof'}
          </button>
        </div>
      </div>
    </div>
  )
}

function PendingApproval({ onRefresh }: { onRefresh: () => Promise<unknown> }) {
  const [refreshing, setRefreshing] = useState(false)

  async function handleRefresh() {
    setRefreshing(true)
    try {
      await onRefresh()
      toast.success('Status updated')
    } finally {
      setRefreshing(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center max-w-md"
      >
        <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
          <CheckIcon className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Request Submitted!</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Your payment screenshot has been received. An admin will verify your payment and activate your subscription shortly.
        </p>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            You will be taken to your library setup automatically once your payment is verified. This usually takes 5 to 10 minutes.
          </p>
          <p>other wise please call this number +91 7796849206</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="px-5 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium transition-colors disabled:opacity-50"
        >
          {refreshing ? 'Checking...' : 'Check status'}
        </button>
      </motion.div>
    </div>
  )
}
