import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { memberService } from '../../services/memberService'
import type { Member } from '../../types'
import LoadingSpinner from '../../components/LoadingSpinner'
import ProtectedImage from '../../components/ProtectedImage'
import toast from 'react-hot-toast'

function todayStr() {
  const d = new Date()
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 10)
}

export default function ExpiredMembers() {
  const navigate = useNavigate()
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)

  const [payTarget, setPayTarget] = useState<Member | null>(null)
  const [payDate, setPayDate] = useState('')
  const [payMethod, setPayMethod] = useState('CASH')
  const [payAmount, setPayAmount] = useState('')
  const [payRemarks, setPayRemarks] = useState('')
  const [paying, setPaying] = useState(false)

  function coverageStart(m: Member) {
    return m.paidUpTo || m.joinDate || todayStr()
  }

  async function loadExpired() {
    setLoading(true)
    try {
      setMembers(await memberService.getFeeExpired())
    } catch { toast.error('Failed to load expired members') }
    finally { setLoading(false) }
  }

  useEffect(() => { loadExpired() }, [])

  function openPayModal(m: Member) {
    setPayTarget(m)
    setPayDate(todayStr())
    setPayMethod('CASH')
    setPayAmount(String(m.feeAmount || ''))
    setPayRemarks('')
  }

  async function confirmPayment() {
    if (!payTarget || !payDate) return
    setPaying(true)
    try {
      await memberService.recordPayment(payTarget.id, {
        payDate,
        method: payMethod as 'CASH' | 'UPI' | 'CARD' | 'BANK_TRANSFER',
        amount: payAmount ? Number(payAmount) : undefined,
        remarks: payRemarks || undefined,
      })
      toast.success('Fee marked paid')
      setPayTarget(null)
      loadExpired()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg || 'Failed to update fee status')
    } finally { setPaying(false) }
  }

  function daysExpired(m: Member) {
    const upto = m.paidUpTo || m.joinDate
    if (!upto) return 0
    return Math.max(0, Math.floor((Date.now() - new Date(upto + 'T00:00:00').getTime()) / 86400000))
  }

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Expired Members</h1>
        <button onClick={loadExpired} className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium">
          Refresh
        </button>
      </div>

      <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
        {members.length} member{members.length === 1 ? '' : 's'} with expired fee coverage.
      </p>

      {members.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">No expired members — all fees are up to date</div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Phone</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Fee</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Coverage Until</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Seat</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map(m => (
                <tr key={m.id} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <ProtectedImage src={m.photo} className="w-8 h-8 rounded-full object-cover" />
                      <span className="font-medium text-gray-900 dark:text-white">{m.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{m.phone}</td>
                  <td className="px-4 py-3 text-gray-900 dark:text-white">₹{m.feeAmount || 0}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                      {m.paidUpTo ? new Date(m.paidUpTo).toLocaleDateString() : 'Never paid'}
                    </span>
                    {daysExpired(m) > 0 && <div className="mt-1 text-xs text-red-600 dark:text-red-400">{daysExpired(m)} day{daysExpired(m) === 1 ? '' : 's'} expired</div>}
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{m.allocatedSeat || '-'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => openPayModal(m)} className="px-2 py-1 rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs hover:bg-green-200">Collect Payment</button>
                      <button onClick={() => navigate(`/owner/members/${m.id}/payments`)} className="px-2 py-1 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs hover:bg-blue-200">History</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {payTarget && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50" onClick={() => !paying && setPayTarget(null)}>
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="my-auto w-full max-w-md max-h-[calc(100vh-2rem)] overflow-y-auto bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-xl" onClick={e => e.stopPropagation()}>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Collect Payment</h2>
              <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
                Record payment for <strong className="text-gray-900 dark:text-white">{payTarget.name}</strong>.
              </p>
              <div className="mt-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 p-3 text-xs text-gray-700 dark:text-gray-300">
                Coverage expired on <strong>{payTarget.paidUpTo ? new Date(payTarget.paidUpTo).toLocaleDateString() : '—'}</strong>. Payment will be anchored to{' '}
                <strong>{coverageStart(payTarget) === payTarget.paidUpTo ? 'existing coverage' : `join date (${new Date(payTarget.joinDate).toLocaleDateString()})`}</strong>
                {payTarget.feeCycle && <> ({payTarget.feeCycle.toLowerCase().replace('_', '-')} cycle)</>}.
              </div>
              <div className="mt-4 space-y-3">
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Payment Date</label>
                  <input
                    type="date"
                    value={payDate}
                    onChange={e => setPayDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm outline-none focus:border-primary-500 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Method</label>
                  <select
                    value={payMethod}
                    onChange={e => setPayMethod(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm outline-none focus:border-primary-500 text-gray-900 dark:text-white"
                  >
                    <option value="CASH">Cash</option>
                    <option value="UPI">UPI</option>
                    <option value="CARD">Card</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Amount Received (leave blank for {payTarget.feeAmount ? `₹${payTarget.feeAmount}` : 'the fee amount'})</label>
                  <input
                    type="number"
                    value={payAmount}
                    onChange={e => setPayAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm outline-none focus:border-primary-500 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Remarks (optional)</label>
                  <input
                    type="text"
                    value={payRemarks}
                    onChange={e => setPayRemarks(e.target.value)}
                    placeholder="e.g. paid by father, UPI ref 1234..."
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm outline-none focus:border-primary-500 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              <div className="mt-5 flex gap-3 justify-end">
                <button
                  onClick={() => setPayTarget(null)}
                  disabled={paying}
                  className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm font-medium hover:bg-gray-200 disabled:opacity-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmPayment}
                  disabled={paying || !payDate}
                  className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium disabled:opacity-50 transition-colors"
                >
                  {paying ? 'Confirming...' : 'Confirm Payment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
