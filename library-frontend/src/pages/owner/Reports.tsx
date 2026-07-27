import { useState, useEffect } from 'react'
import { reportService } from '../../services/reportService'
import { memberService } from '../../services/memberService'
import { subscriptionService } from '../../services/subscriptionService'
import type { Subscription, Member } from '../../types'
import LoadingSpinner from '../../components/LoadingSpinner'
import toast from 'react-hot-toast'

export default function OwnerReports() {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [startDate, setStartDate] = useState(() => {
    const d = new Date()
    d.setMonth(d.getMonth() - 1)
    return d.toISOString().split('T')[0]
  })
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0])
  const [downloading, setDownloading] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      subscriptionService.getMySubscription(),
      memberService.getAll(),
    ]).then(([sub, mem]) => {
      setSubscription(sub)
      setMembers(mem)
    }).catch(() => {})
    .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner />

  const isPro = subscription?.packageType === 'PRO' && subscription?.status === 'ACTIVE'

  async function handleDownload(type: string) {
    if (!isPro) { toast.error('PDF reports are only available for Pro plan subscribers'); return }
    setDownloading(type)
    try {
      if (type === 'payment') {
        await reportService.downloadPaymentReport(startDate, endDate)
        toast.success('Payment report downloaded')
      } else if (type === 'members') {
        await reportService.downloadMemberReport()
        toast.success('Member report downloaded')
      } else if (type === 'utilization') {
        await reportService.downloadUtilizationReport()
        toast.success('Utilization report downloaded')
      }
    } catch {
      toast.error('Failed to download report')
    } finally { setDownloading(null) }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {isPro ? 'Download PDF reports for your library' : 'Upgrade to Pro to download PDF reports'}
          </p>
        </div>
        {!isPro && (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
            Pro Feature
          </span>
        )}
      </div>

      {isPro && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Date Range</h2>
          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Start Date</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white outline-none focus:border-primary-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">End Date</label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white outline-none focus:border-primary-500" />
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ReportCard
          title="Payment Report"
          description="Member-wise fee status and payment collection summary"
          icon="B"
          isPro={isPro}
          downloading={downloading === 'payment'}
          onDownload={() => handleDownload('payment')}
        />
        <ReportCard
          title="Member Report"
          description="Complete list of all members with their details"
          icon="M"
          isPro={isPro}
          downloading={downloading === 'members'}
          onDownload={() => handleDownload('members')}
        />
        <ReportCard
          title="Seat Utilization"
          description="Floor-wise seat occupancy and availability report"
          icon="S"
          isPro={isPro}
          downloading={downloading === 'utilization'}
          onDownload={() => handleDownload('utilization')}
        />
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Payment History</h2>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Phone</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Fee Amount</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Join Date</th>
              </tr>
            </thead>
            <tbody>
              {members.map(m => (
                <tr key={m.id} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{m.name}</td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{m.phone}</td>
                  <td className="px-4 py-3 text-gray-900 dark:text-white">Rs.{m.feeAmount || 0}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${feeStatusColor(m.feeStatus)}`}>{m.feeStatus}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{m.joinDate ? new Date(m.joinDate).toLocaleDateString() : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function ReportCard({ title, description, icon, isPro, downloading, onDownload }: {
  title: string; description: string; icon: string; isPro: boolean; downloading: boolean; onDownload: () => void
}) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 ${!isPro ? 'opacity-60' : ''}`}>
      <div className="text-3xl mb-3 font-bold text-primary-600">{icon}</div>
      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{title}</h3>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">{description}</p>
      <button onClick={onDownload} disabled={!isPro || downloading}
        className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isPro ? 'bg-primary-600 hover:bg-primary-700 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'} disabled:opacity-50`}>
        {downloading ? 'Downloading...' : isPro ? 'Download PDF' : 'Upgrade to Pro'}
      </button>
    </div>
  )
}

function feeStatusColor(status: string) {
  const map: Record<string, string> = {
    PAID: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    UNPAID: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    PARTIAL: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  }
  return map[status] || ''
}
