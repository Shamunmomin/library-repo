import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { memberService } from '../../services/memberService'
import type { Member, MemberPayment } from '../../types'
import LoadingSpinner from '../../components/LoadingSpinner'
import ProtectedImage from '../../components/ProtectedImage'
import toast from 'react-hot-toast'

export default function MemberPaymentHistory() {
  const { memberId } = useParams<{ memberId: string }>()
  const navigate = useNavigate()
  const [member, setMember] = useState<Member | null>(null)
  const [payments, setPayments] = useState<MemberPayment[]>([])
  const [loading, setLoading] = useState(true)

  const [voidTarget, setVoidTarget] = useState<MemberPayment | null>(null)
  const [voidReason, setVoidReason] = useState('')
  const [voiding, setVoiding] = useState(false)

  function loadData(mId: string) {
    setLoading(true)
    Promise.all([
      memberService.getById(mId),
      memberService.getMemberPayments(mId),
    ]).then(([m, p]) => {
      setMember(m)
      setPayments(p)
    }).catch(() => toast.error('Failed to load payment history'))
    .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (!memberId) return
    loadData(memberId)
  }, [memberId])

  async function confirmVoid() {
    if (!memberId || !voidTarget || !voidReason.trim()) return
    setVoiding(true)
    try {
      await memberService.voidPayment(memberId, voidTarget.id, voidReason.trim())
      toast.success('Payment reversed')
      setVoidTarget(null)
      setVoidReason('')
      loadData(memberId)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg || 'Failed to reverse payment')
    } finally { setVoiding(false) }
  }

  if (loading) return <LoadingSpinner />

  if (!member) return <div className="text-center py-12 text-gray-500">Member not found</div>

  const statusBadge = (status: string) =>
    status === 'COMPLETED'
      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'

  const feeBadge = member.effectiveFeeStatus === 'PAID'
    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
    : member.effectiveFeeStatus === 'PARTIAL'
      ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
      : member.effectiveFeeStatus === 'EXPIRED'
        ? 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'

  return (
    <div>
      <button
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 mb-6">
        <div className="flex items-center gap-4">
          <ProtectedImage
            src={member.photo}
            className="w-14 h-14 rounded-full object-cover"
            fallback={
              <div className="w-14 h-14 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-300 font-bold text-xl">
                {member.name.charAt(0)}
              </div>
            }
          />
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{member.name}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{member.phone}</p>
            {member.email && <p className="text-xs text-gray-400 dark:text-gray-500">{member.email}</p>}
          </div>
          <div className="ml-auto text-right">
            <p className="text-sm text-gray-500 dark:text-gray-400">Cycle Fee ({member.feeCycle?.toLowerCase().replace('_', '-')})</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">Rs.{member.feeAmount || 0}</p>
          </div>
        </div>
        <div className="mt-3 flex gap-4 text-sm">
          <div>
            <span className="text-gray-500 dark:text-gray-400">Paid Up To: </span>
            <span className="text-gray-900 dark:text-white font-medium">
              {member.paidUpTo ? new Date(member.paidUpTo).toLocaleDateString() : '-'}
            </span>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Status: </span>
            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${feeBadge}`}>{member.effectiveFeeStatus}</span>
          </div>
        </div>
      </div>

      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Payment History</h2>

      {payments.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">No payment records found</div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">#</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Receipt</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Date</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Method</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Amount</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Period Covered</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p, i) => (
                <tr key={p.id} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{i + 1}</td>
                  <td className="px-4 py-3 text-gray-900 dark:text-white font-mono text-xs">{p.receiptNo || '-'}</td>
                  <td className="px-4 py-3 text-gray-900 dark:text-white">{new Date(p.paymentDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-gray-900 dark:text-white">{p.method ? p.method.replace('_', ' ') : '-'}</td>
                  <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">Rs.{p.amount || 0}</td>
                  <td className="px-4 py-3 text-gray-900 dark:text-white">
                    {p.periodStart ? `${new Date(p.periodStart).toLocaleDateString()} → ` : ''}
                    {new Date(p.paidUpTo).toLocaleDateString()}
                    {p.remarks && <div className="text-xs text-gray-400 dark:text-gray-500">{p.remarks}</div>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge(p.status)}`}>{p.status}</span>
                    {p.status === 'REVERSED' && p.reverseReason && (
                      <div className="mt-1 text-xs text-gray-400 dark:text-gray-500" title={p.reverseReason}>reason: {p.reverseReason}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {p.status === 'COMPLETED' && (
                      <button
                        onClick={() => { setVoidTarget(p); setVoidReason('') }}
                        className="px-2 py-1 rounded bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs hover:bg-red-200"
                      >
                        Reverse
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {voidTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => !voiding && setVoidTarget(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Reverse Payment</h2>
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
              Reverse receipt <strong className="text-gray-900 dark:text-white">{voidTarget.receiptNo}</strong> for{' '}
              <strong className="text-gray-900 dark:text-white">Rs.{voidTarget.amount || 0}</strong>? The member's paid-up-to date will be recalculated from remaining payments.
            </p>
            <div className="mt-4">
              <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Reason *</label>
              <input
                type="text"
                value={voidReason}
                onChange={e => setVoidReason(e.target.value)}
                placeholder="e.g. wrong amount recorded"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm outline-none focus:border-primary-500 text-gray-900 dark:text-white"
              />
            </div>
            <div className="mt-5 flex gap-3 justify-end">
              <button
                onClick={() => setVoidTarget(null)}
                disabled={voiding}
                className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm font-medium hover:bg-gray-200 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmVoid}
                disabled={voiding || !voidReason.trim()}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium disabled:opacity-50 transition-colors"
              >
                {voiding ? 'Reversing...' : 'Reverse Payment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
