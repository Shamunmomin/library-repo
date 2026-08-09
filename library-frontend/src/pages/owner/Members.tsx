import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { memberService } from '../../services/memberService'
import { subscriptionService } from '../../services/subscriptionService'
import type { Member, Subscription } from '../../types'
import LoadingSpinner from '../../components/LoadingSpinner'
import ProtectedImage from '../../components/ProtectedImage'
import toast from 'react-hot-toast'
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline'

export default function OwnerMembers() {
  const navigate = useNavigate()
  const [members, setMembers] = useState<Member[]>([])
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'ALL' | 'PAID' | 'UNPAID' | 'EXPIRED' | 'PARTIAL'>('ALL')
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', monthlyBase: '', feeAmount: '', feeCycle: 'MONTHLY', joinDate: '' })
  const [photo, setPhoto] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [debouncedSearch, setDebouncedSearch] = useState('')

  const [payTarget, setPayTarget] = useState<Member | null>(null)
  const [payDate, setPayDate] = useState('')
  const [payMethod, setPayMethod] = useState('CASH')
  const [payAmount, setPayAmount] = useState('')
  const [payRemarks, setPayRemarks] = useState('')
  const [payOverride, setPayOverride] = useState('')
  const [paying, setPaying] = useState(false)

  const CYCLE_MONTHS: Record<string, number> = { MONTHLY: 1, QUARTERLY: 3, HALF_YEARLY: 6, YEARLY: 12 }

  function autoFee(monthly: string, cycle: string) {
    const m = Number(monthly)
    if (!m || m <= 0) return ''
    return String(Math.round(m * (CYCLE_MONTHS[cycle] || 1)))
  }

  function onMonthlyBaseChange(v: string) {
    setForm(p => ({ ...p, monthlyBase: v, feeAmount: autoFee(v, p.feeCycle) }))
  }

  function onCycleChange(v: string) {
    setForm(p => ({ ...p, feeCycle: v, feeAmount: autoFee(p.monthlyBase, v) }))
  }

  function addMonths(dateStr: string, months: number) {
    const d = new Date(dateStr + 'T00:00:00')
    const day = d.getDate()
    d.setDate(1)
    d.setMonth(d.getMonth() + months)
    const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
    d.setDate(Math.min(day, lastDay))
    const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    return local.toISOString().slice(0, 10)
  }

  function coverageStart(m: Member) {
    return m.paidUpTo || m.joinDate || todayStr()
  }

  function autoCoverageEnd(m: Member) {
    const months = CYCLE_MONTHS[m.feeCycle] || 1
    return addMonths(coverageStart(m), months)
  }

  function todayStr() {
    const d = new Date()
    const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    return local.toISOString().slice(0, 10)
  }

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => { setPage(0) }, [debouncedSearch, filter])

  useEffect(() => {
    subscriptionService.getMySubscription()
      .then(setSubscription)
      .catch(() => {})
  }, [])

  useEffect(() => { loadMembers() }, [page, debouncedSearch, filter])

  async function loadMembers() {
    setLoading(true)
    try {
      const data = await memberService.getAll({
        page,
        size: 10,
        search: debouncedSearch || undefined,
        feeStatus: filter === 'ALL' ? undefined : filter,
      })
      setMembers(data.content)
      setTotalPages(data.totalPages)
      setTotalElements(data.totalElements)
    } catch (error: unknown) {
      toast.error((error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to load members')
    }
    finally { setLoading(false) }
  }

  function resetForm() {
    setForm({ name: '', email: '', phone: '', address: '', monthlyBase: '', feeAmount: '', feeCycle: 'MONTHLY', joinDate: '' })
    setPhoto(null); setEditId(null); setShowForm(false)
  }

  function startEdit(m: Member) {
    const months = CYCLE_MONTHS[m.feeCycle] || 1
    setForm({
      name: m.name, email: m.email || '', phone: m.phone, address: m.address || '',
      monthlyBase: String(Math.round((m.feeAmount || 0) / months)),
      feeAmount: String(m.feeAmount || ''),
      feeCycle: m.feeCycle || 'MONTHLY',
      joinDate: m.joinDate || '',
    })
    setEditId(m.id); setShowForm(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim() || !form.phone.trim()) { toast.error('Name and phone are required'); return }
    setIsSubmitting(true)
    try {
      if (editId) {
        await memberService.update(editId, { ...form, feeAmount: form.feeAmount ? Number(form.feeAmount) : undefined })
        toast.success('Member updated')
      } else {
        await memberService.create({
          name: form.name.trim(), email: form.email.trim() || undefined,
          phone: form.phone.trim(), address: form.address.trim() || undefined,
          feeAmount: form.feeAmount ? Number(form.feeAmount) : undefined,
          feeCycle: form.feeCycle,
          photo: photo || undefined,
          joinDate: form.joinDate || undefined,
        })
        toast.success('Member added')
      }
      resetForm(); loadMembers()
    } catch (err: unknown) {
       console.log("FULL ERROR:", err);
     const e = err as { response?: { status?: number; data?: { message?: string } } }
  const msg = e?.response?.status === 409
    ? e?.response?.data?.message || 'A member with the same contact details already exists.'
    : e?.response?.data?.message || 'Operation failed'
  toast.error(msg)
    } finally { setIsSubmitting(false) }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this member?')) return
    try { await memberService.delete(id); toast.success('Member deleted'); loadMembers() }
    catch { toast.error('Failed to delete') }
  }

  function openHistory(m: Member) {
    if (!isPro) {
      toast.error('Payment history is only available for Pro plan subscribers')
      return
    }
    navigate(`/owner/members/${m.id}/payments`)
  }

  function openPayModal(m: Member) {
    setPayTarget(m)
    setPayDate(todayStr())
    setPayMethod('CASH')
    setPayAmount(String(m.feeAmount || ''))
    setPayRemarks('')
    setPayOverride('')
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
        paidUpTo: payOverride || undefined,
      })
      toast.success('Fee marked paid')
      setPayTarget(null)
      loadMembers()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg || 'Failed to update fee status')
    } finally { setPaying(false) }
  }

  const feeColors: Record<string, string> = {
    PAID: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    UNPAID: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    PARTIAL: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
    EXPIRED: 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  }

  const isPro = subscription?.packageType === 'PRO' && subscription?.status === 'ACTIVE'

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Members</h1>
        <button onClick={() => { resetForm(); setShowForm(true) }} className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium">
          + Add Member
        </button>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <input value={search} onChange={e => setSearch(e.target.value)} className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm outline-none focus:border-primary-500 text-gray-900 dark:text-white w-60" placeholder="Search by name or phone..." />
        {(['ALL', 'PAID', 'UNPAID', 'EXPIRED', 'PARTIAL'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === f ? 'bg-primary-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700'}`}>
            {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-6 space-y-3 max-w-lg">
          <div className="grid grid-cols-2 gap-3">
            <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="col-span-2 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm outline-none focus:border-primary-500 text-gray-900 dark:text-white" placeholder="Full name *" />
            <input value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm outline-none focus:border-primary-500 text-gray-900 dark:text-white" placeholder="Email" type='email'/>
            <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm outline-none focus:border-primary-500 text-gray-900 dark:text-white" placeholder="Phone *" maxLength={10} />
            <input value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} className="col-span-2 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm outline-none focus:border-primary-500 text-gray-900 dark:text-white" placeholder="Address" />
            <div className="flex flex-col gap-1">
  <label className="text-sm text-gray-700 dark:text-gray-300">
    Joined Date *
  </label>
            <input value={form.joinDate} onChange={e => setForm(p => ({ ...p, joinDate: e.target.value }))} className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm outline-none focus:border-primary-500 text-gray-900 dark:text-white" type="date" />
          </div>
            <input value={form.monthlyBase} onChange={e => onMonthlyBaseChange(e.target.value)} className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm outline-none focus:border-primary-500 text-gray-900 dark:text-white" placeholder="Monthly fee (base) ₹" type="number" />
            <select value={form.feeCycle} onChange={e => onCycleChange(e.target.value)} className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm outline-none focus:border-primary-500 text-gray-900 dark:text-white">
              <option value="MONTHLY">Monthly cycle</option>
              <option value="QUARTERLY">Quarterly cycle</option>
              <option value="HALF_YEARLY">Half-yearly cycle</option>
              <option value="YEARLY">Yearly cycle</option>
            </select>
            <input value={form.feeAmount} disabled  className="col-span-2 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm outline-none focus:border-primary-500 text-gray-900 dark:text-white" placeholder="Total fee for cycle (auto-calculated) ₹" type="number" />
            {form.monthlyBase && Number(form.monthlyBase) > 0 && (
              <p className="col-span-2 text-xs text-gray-500 dark:text-gray-400">
                ₹{Number(form.monthlyBase).toLocaleString()} × {CYCLE_MONTHS[form.feeCycle] || 1} month{CYCLE_MONTHS[form.feeCycle] === 1 ? '' : 's'} = ₹{(Number(form.feeAmount) || 0).toLocaleString()}
              </p>
            )}
            {!editId && <input type="file" accept="image/*" onChange={e => setPhoto(e.target.files?.[0] || null)} className="text-sm text-gray-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-primary-50 dark:file:bg-primary-900/30 file:text-primary-700 cursor-pointer" />}
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium disabled:opacity-50">
              {isSubmitting ? 'Saving...' : editId ? 'Update' : 'Add Member'}
            </button>
            <button type="button" onClick={resetForm} className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm font-medium">Cancel</button>
          </div>
        </form>
      )}

      {members.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">No members found</div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Phone</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Fee</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Status</th>
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
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${feeColors[m.effectiveFeeStatus] || ''}`}>{m.effectiveFeeStatus}</span>
                    {m.paidUpTo && <div className="mt-1 text-xs text-gray-400 dark:text-gray-500">until {new Date(m.paidUpTo).toLocaleDateString()}</div>}
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{m.allocatedSeat || '-'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                                            {m.effectiveFeeStatus !== 'PAID' && <button onClick={() => openPayModal(m)} className="px-2 py-1 rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs hover:bg-green-200">Pay</button>}
                      <button onClick={() => openHistory(m)} title="Payment History" aria-label="Payment History" className="inline-flex items-center px-2 py-1 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs hover:bg-blue-200">
                        <span className="hidden sm:inline">History</span>
                        <span className="sm:hidden">H</span>
                      </button>
                      <button onClick={() => startEdit(m)} title="Edit" aria-label="Edit" className="inline-flex items-center px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs hover:bg-gray-200">
                        <PencilIcon className="h-4 w-4 sm:hidden" />
                        <span className="hidden sm:inline">Edit</span>
                      </button>
                      <button onClick={() => handleDelete(m.id)} title="Delete" aria-label="Delete" className="inline-flex items-center px-2 py-1 rounded bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs hover:bg-red-200">
                        <TrashIcon className="h-4 w-4 sm:hidden" />
                        <span className="hidden sm:inline">Del</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center justify-between mt-4">
        <span className="text-xs text-gray-500 dark:text-gray-400">{totalElements} member{totalElements === 1 ? '' : 's'}</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Prev
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-300">
            Page {totalPages === 0 ? 0 : page + 1} of {Math.max(totalPages, 1)}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>

      {payTarget && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50" onClick={() => !paying && setPayTarget(null)}>
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="my-auto w-full max-w-md max-h-[calc(100vh-2rem)] overflow-y-auto bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Confirm Payment</h2>
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
              Record payment for <strong className="text-gray-900 dark:text-white">{payTarget.name}</strong>.
            </p>
            <div className="mt-3 rounded-lg bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800 p-3 text-xs text-gray-700 dark:text-gray-300">
              {payOverride ? (
                <span>
                  Coverage set manually: <strong>{coverageStart(payTarget) === payTarget.paidUpTo ? new Date(payTarget.paidUpTo).toLocaleDateString() : new Date(payTarget.joinDate).toLocaleDateString()}</strong> → <strong>{new Date(payOverride).toLocaleDateString()}</strong>
                  ({payTarget.feeCycle?.toLowerCase().replace('_', '-')} cycle)
                </span>
              ) : (
                <span>
                  This payment extends coverage from <strong>{new Date(coverageStart(payTarget)).toLocaleDateString()}</strong> to <strong>{new Date(autoCoverageEnd(payTarget)).toLocaleDateString()}</strong>
                  ({payTarget.feeCycle?.toLowerCase().replace('_', '-')} cycle)
                </span>
              )}
              {!payOverride && coverageStart(payTarget) !== payDate && (
                <span className="block mt-1 text-gray-500 dark:text-gray-400">
                  Billing is anchored to {payTarget.paidUpTo ? 'existing coverage' : `join date (${new Date(payTarget.joinDate).toLocaleDateString()})`} — not the payment date.
                </span>
              )}
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
              {/* <div>
                <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Set Coverage Until (optional — overrides auto-calc)</label>
                <input
                  type="date"
                  value={payOverride}
                  min={addMonths(coverageStart(payTarget), 1)}
                  onChange={e => setPayOverride(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm outline-none focus:border-primary-500 text-gray-900 dark:text-white"
                />
                {payOverride && new Date(payOverride) <= new Date(coverageStart(payTarget)) && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">Must be after {new Date(coverageStart(payTarget)).toLocaleDateString()}.</p>
                )}
              </div> */}
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
                {payTarget.feeAmount && Number(payAmount) > 0 && Number(payAmount) < payTarget.feeAmount && (
                  <p className="mt-1 text-xs text-yellow-600 dark:text-yellow-400">Amount is less than the cycle fee — member will be marked PARTIAL.</p>
                )}
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
