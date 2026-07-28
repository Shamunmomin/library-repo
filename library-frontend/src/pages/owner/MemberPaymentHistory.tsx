import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { memberService } from '../../services/memberService'
import type { Member, MemberPayment } from '../../types'
import LoadingSpinner from '../../components/LoadingSpinner'
import toast from 'react-hot-toast'

export default function MemberPaymentHistory() {
  const { memberId } = useParams<{ memberId: string }>()
  const navigate = useNavigate()
  const [member, setMember] = useState<Member | null>(null)
  const [payments, setPayments] = useState<MemberPayment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!memberId) return
    Promise.all([
      memberService.getById(memberId),
      memberService.getMemberPayments(memberId),
    ]).then(([m, p]) => {
      setMember(m)
      setPayments(p)
    }).catch(() => toast.error('Failed to load payment history'))
    .finally(() => setLoading(false))
  }, [memberId])

  if (loading) return <LoadingSpinner />

  if (!member) return <div className="text-center py-12 text-gray-500">Member not found</div>

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
          {member.photo ? (
            <img src={member.photo} alt="" className="w-14 h-14 rounded-full object-cover" />
          ) : (
            <div className="w-14 h-14 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-300 font-bold text-xl">
              {member.name.charAt(0)}
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{member.name}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{member.phone}</p>
            {member.email && <p className="text-xs text-gray-400 dark:text-gray-500">{member.email}</p>}
          </div>
          <div className="ml-auto text-right">
            <p className="text-sm text-gray-500 dark:text-gray-400">Monthly Fee</p>
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
            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
              member.feeStatus === 'PAID' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
              member.feeStatus === 'PARTIAL' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
              'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
            }`}>{member.feeStatus}</span>
          </div>
        </div>
      </div>

      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Payment History</h2>

      {payments.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">No payment records found</div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-x-auto">
          <table className="w-full text-sm min-w-[500px]">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">#</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Date</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Amount</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Paid Up To</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p, i) => (
                <tr key={p.id} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{i + 1}</td>
                  <td className="px-4 py-3 text-gray-900 dark:text-white">{new Date(p.paymentDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">Rs.{p.amount || 0}</td>
                  <td className="px-4 py-3 text-gray-900 dark:text-white">{new Date(p.paidUpTo).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
