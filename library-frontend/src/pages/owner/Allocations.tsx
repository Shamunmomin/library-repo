import { useState, useEffect } from 'react'
import { allocationService } from '../../services/allocationService'
import { memberService } from '../../services/memberService'
import { floorService } from '../../services/floorService'
import { seatService } from '../../services/seatService'
import type { SeatAllocation, Member, Floor, Seat } from '../../types'
import LoadingSpinner from '../../components/LoadingSpinner'
import toast from 'react-hot-toast'
import {  UserMinusIcon } from '@heroicons/react/24/outline'

export default function OwnerAllocations() {
  const [allocations, setAllocations] = useState<SeatAllocation[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [floors, setFloors] = useState<Floor[]>([])
  const [seats, setSeats] = useState<Seat[]>([])
  const [loading, setLoading] = useState(true)

  const [selectedFloor, setSelectedFloor] = useState('')
  const [selectedSeat, setSelectedSeat] = useState('')
  const [selectedMember, setSelectedMember] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    Promise.all([
      allocationService.getActive(),
      memberService.getAvailableForAllocation(),
      floorService.getMyFloors(),
    ]).then(([a, m, f]) => {
      setAllocations(a)
      setMembers(m)
      setFloors(f)
    }).catch(() => toast.error('Failed to load data'))
    .finally(() => setLoading(false))
  }, [])

  async function loadSeats(floorId: string) {
    try {
      const data = await seatService.getByFloor(floorId)
      setSeats(data.filter(s => s.status === 'AVAILABLE'))
    } catch { toast.error('Failed to load seats') }
  }

  async function handleAllocate() {
    if (!selectedSeat || !selectedMember) { toast.error('Select a seat and member'); return }
    const member = members.find(m => m.id === selectedMember)
    if (member && member.effectiveFeeStatus !== 'PAID') {
      toast(
        `${member.name} has ${member.effectiveFeeStatus} fee status. Please collect fee first.`,
        { style: { background: '#d97706', color: '#fff', fontSize: '14px' } }
      )
      return
    }
    setIsSubmitting(true)
    try {
      await allocationService.allocate(selectedSeat, selectedMember)
      toast.success('Seat allocated!')
      setSelectedFloor(''); setSelectedSeat(''); setSelectedMember(''); setSeats([])
      const [a] = await Promise.all([
        allocationService.getActive(),
        seatService.getByFloor(selectedFloor),
      ])
      setAllocations(a)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg || 'Allocation failed')
    } finally { setIsSubmitting(false) }
  }

  async function  handleEndAllocation(id: string) {
    if (!confirm('End this allocation?')) return
    try {
      await allocationService.endAllocation(id)
      toast.success('Allocation ended')
      const data = await allocationService.getActive()
      setAllocations(data)
    } catch { toast.error('Failed to end allocation') }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Seat Allocations</h1>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Allocate a Seat</h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-3">
          <select value={selectedFloor} onChange={e => { setSelectedFloor(e.target.value); setSelectedSeat(''); loadSeats(e.target.value) }} className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white outline-none focus:border-primary-500">
            <option value="">Select Floor/Room</option>
            {floors.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
          <select value={selectedSeat} onChange={e => setSelectedSeat(e.target.value)} className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white outline-none focus:border-primary-500" disabled={!selectedFloor}>
            <option value="">Select Seat</option>
            {[...seats].sort((a, b) => Number(a.seatNumber) - Number(b.seatNumber) || a.seatNumber.localeCompare(b.seatNumber)).map(s => <option key={s.id} value={s.id}>{s.seatNumber}</option>)}
          </select>
          <SearchableMemberSelect members={members} value={selectedMember} onChange={setSelectedMember} />
          <button onClick={handleAllocate} disabled={isSubmitting || !selectedSeat || !selectedMember} className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium transition-colors disabled:opacity-50">
            {isSubmitting ? 'Allocating...' : 'Allocate'}
          </button>
        </div>
      </div>

      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Active Allocations ({allocations.length})</h2>

      {allocations.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">No active allocations</div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto"><table className="w-full text-sm min-w-[500px]">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Member</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Seat</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Start Date</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Action</th>
              </tr>
            </thead>
            <tbody>
              {allocations.map(a => (
                <tr key={a.id} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{a?.memberName}</td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{a?.seatNumber}</td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{new Date(a.startDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleEndAllocation(a.id)}  title="Delete" aria-label="Delete" className="inline-flex items-center px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 text-xs font-medium hover:bg-red-100 transition-colors">
                     <UserMinusIcon className="h-4 w-4 sm:hidden" />
                      <span className="hidden sm:inline">End</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table></div>
        </div>
      )}
    </div>
  )
}

function SearchableMemberSelect({ members, value, onChange }: { members: Member[]; value: string; onChange: (id: string) => void }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const selected = members.find(m => m.id === value)
  const filtered = members.filter(m =>
    m.name.toLowerCase().includes(query.toLowerCase()) ||
    (m.phone && m.phone.toLowerCase().includes(query.toLowerCase()))
  )

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm outline-none focus:border-primary-500 flex items-center justify-between gap-2 text-left"
      >
        <span className={`truncate ${selected ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'}`}>
          {selected ? `${selected.name} (${selected.effectiveFeeStatus})` : 'Search & Select Member'}
        </span>
        <svg className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute z-20 mt-1 w-full max-h-64 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg">
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search by name or phone"
              autoFocus
              className="w-full px-3 py-2 sticky top-0 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm outline-none focus:border-primary-500 text-gray-900 dark:text-white"
            />
            {filtered.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">No members found</div>
            ) : (
              filtered.map(m => (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => { onChange(m.id); setOpen(false); setQuery('') }}
                  className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-sm text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50 ${m.id === value ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300' : 'text-gray-900 dark:text-white'}`}
                >
                  <span className="truncate">{m.name}</span>
                  <span className={`shrink-0 text-xs px-1.5 py-0.5 rounded-full ${m.effectiveFeeStatus === 'PAID' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : m.effectiveFeeStatus === 'PARTIAL' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'}`}>
                    {m.effectiveFeeStatus}
                  </span>
                </button>
              ))
            )}
          </div>
        </>
      )}
    </div>
  )
}
