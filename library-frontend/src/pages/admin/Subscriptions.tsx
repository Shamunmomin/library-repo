import { useState, useEffect } from 'react'
import { adminService } from '../../services/adminService'
import type { Subscription } from '../../types'
import LoadingSpinner from '../../components/LoadingSpinner'
import toast from 'react-hot-toast'

type Filter = 'ALL' | 'PENDING' | 'ACTIVE' | 'REJECTED'

export default function AdminSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [filter, setFilter] = useState<Filter>('ALL')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSubscriptions()
  }, [filter])

  async function loadSubscriptions() {
    setLoading(true)
    try {
      const data = await adminService.getSubscriptions(filter === 'ALL' ? undefined : filter)
      setSubscriptions(data)
    } catch {
      toast.error('Failed to load subscriptions')
    } finally {
      setLoading(false)
    }
  }

  async function handleVerify(id: string, status: 'ACTIVE' | 'REJECTED', rejectionReason?: string) {
    try {
      await adminService.verifySubscription(id, status, rejectionReason)
      toast.success(`Subscription ${status.toLowerCase()} successfully`)
      loadSubscriptions()
    } catch {
      toast.error('Failed to update subscription')
    }
  }

  const filters: Filter[] = ['ALL', 'PENDING', 'ACTIVE', 'REJECTED']

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    ACTIVE: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    EXPIRED: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    REJECTED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Subscription Requests</h1>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors
              ${filter === f
                ? 'bg-primary-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
          >
            {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : subscriptions.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">No subscriptions found</div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">User</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Package</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Screenshot</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Date</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.map(sub => (
                <tr key={sub.id} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td className="px-4 py-3 text-gray-900 dark:text-white">{sub.userName || sub.userId}</td>
                  <td className="px-4 py-3">
                    <span className="font-medium text-gray-900 dark:text-white">{sub.packageType}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[sub.status] || ''}`}>
                      {sub.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {sub.paymentScreenshot ? (
                      <a
                        href={sub.paymentScreenshot}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary-600 hover:underline text-xs"
                      >
                        View Screenshot
                      </a>
                    ) : (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">
                    {new Date(sub.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    {sub.status === 'PENDING' ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleVerify(sub.id, 'ACTIVE')}
                          className="px-3 py-1 rounded-md bg-green-600 hover:bg-green-700 text-white text-xs font-medium transition-colors"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => {
                            const reason = prompt('Rejection reason (optional):')
                            handleVerify(sub.id, 'REJECTED', reason || undefined)
                          }}
                          className="px-3 py-1 rounded-md bg-red-600 hover:bg-red-700 text-white text-xs font-medium transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
