import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { seatService } from '../../services/seatService'
import { floorService } from '../../services/floorService'
import { memberService } from '../../services/memberService'
import { allocationService } from '../../services/allocationService'
import type { Seat, Floor, Member, SeatAllocation } from '../../types'
import LoadingSpinner from '../../components/LoadingSpinner'
import toast from 'react-hot-toast'

const statusColors: Record<string, string> = {
  AVAILABLE: 'bg-green-100 border-green-300 text-green-700 dark:bg-green-900/30 dark:border-green-700 dark:text-green-300',
  OCCUPIED: 'bg-red-100 border-red-300 text-red-700 dark:bg-red-900/30 dark:border-red-700 dark:text-red-300',
  MAINTENANCE: 'bg-yellow-100 border-yellow-300 text-yellow-700 dark:bg-yellow-900/30 dark:border-yellow-700 dark:text-yellow-300',
}

export default function OwnerSeats() {
  const { floorId } = useParams<{ floorId: string }>()
  const [floor, setFloor] = useState<Floor | null>(null)
  const [seats, setSeats] = useState<Seat[]>([])
  const [loading, setLoading] = useState(true)
  const [addMode, setAddMode] = useState<'bulk' | 'single' | null>(null)
  const [showAddMenu, setShowAddMenu] = useState(false)
  const [bulkCount, setBulkCount] = useState('')
  const [bulkError, setBulkError] = useState<string | null>(null)
  const [singleInput, setSingleInput] = useState('')

  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null)
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null)
  const [showAllocate, setShowAllocate] = useState(false)
  const [members, setMembers] = useState<Member[]>([])
  const [allocBySeat, setAllocBySeat] = useState<Record<string, SeatAllocation>>({})
  const [allocByMember, setAllocByMember] = useState<Record<string, SeatAllocation>>({})

  const menuRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const addMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!floorId) return
    loadData()
  }, [floorId])

  async function loadData() {
    setLoading(true)
    try {
      const [f, s, allMembers, activeAllocs] = await Promise.all([
        floorService.getById(floorId!),
        seatService.getByFloor(floorId!),
        memberService.getAll(),
        allocationService.getActive(),
      ])
      setFloor(f)
      setSeats(s)
      setMembers(allMembers)
      const seatMap: Record<string, SeatAllocation> = {}
      const memberMap: Record<string, SeatAllocation> = {}
      activeAllocs.forEach(a => { seatMap[a.seatId] = a; memberMap[a.memberId] = a })
      setAllocBySeat(seatMap)
      setAllocByMember(memberMap)
    } catch {
      toast.error('Failed to load seats')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        closeMenu()
      }
      if (
        addMenuRef.current &&
        !addMenuRef.current.contains(e.target as Node)
      ) {
        setShowAddMenu(false)
      }
    }
    if (menuPos || showAddMenu) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [menuPos, showAddMenu])

  function openMenu(seat: Seat, e: React.MouseEvent<HTMLButtonElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    setSelectedSeat(seat)
    setMenuPos({ top: rect.bottom + 4, left: rect.left })
    triggerRef.current = e.currentTarget
  }

  function closeMenu() {
    setSelectedSeat(null)
    setMenuPos(null)
    triggerRef.current = null
  }

  function getNextSeatStart(): number {
    const nums = seats.map(s => Number(s.seatNumber)).filter(n => !isNaN(n))
    return nums.length > 0 ? Math.max(...nums) + 1 : 1
  }

  async function addBulk() {
    setBulkError(null)
    const count = parseInt(bulkCount, 10)
    if (!/^\d+$/.test(bulkCount) || count < 1) {
      setBulkError('Only numbers are allowed')
      return
    }
    if (count > 100) {
      setBulkError('Maximum 100 seats allowed at a time')
      return
    }
    if (!floorId) return
    const start = getNextSeatStart()
    const seatNumbers: string[] = []
    for (let i = 0; i < count; i++) {
      seatNumbers.push(String(start + i))
    }
    try {
      const created = await seatService.createBulk(floorId, seatNumbers)
      setSeats(prev => [...prev, ...created])
      setBulkCount('')
      toast.success(`${created.length} seats added`)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg || 'Failed to add seats')
    }
  }

  async function addSingle() {
    if (!floorId || !singleInput.trim()) return
    try {
      const created = await seatService.create(floorId, singleInput.trim())
      setSeats(prev => [...prev, created])
      setSingleInput('')
      setAddMode(null)
      toast.success('Seat added')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg || 'Failed to add seat')
    }
  }

  async function handleAllocate(memberId: string) {
    if (!selectedSeat) return
    const member = members.find(m => m.id === memberId)
    if (member && member.feeStatus !== 'PAID') {
      toast(
        `${member.name} has ${member.feeStatus} fee status. Please collect fee first.`,
        { style: { background: '#d97706', color: '#fff', fontSize: '14px' } }
      )
      return
    }
    const existing = allocByMember[memberId]
    if (existing) {
      const occupiedSeat = seats.find(s => s.id === existing.seatId)
      toast(
        `${member?.name || 'Member'} already occupies seat ${occupiedSeat?.seatNumber || existing.seatId}`,
        { style: { background: '#dc2626', color: '#fff', fontSize: '14px' } }
      )
      return
    }
    try {
      await allocationService.allocate(selectedSeat.id, memberId)
      toast.success(`Seat ${selectedSeat.seatNumber} allocated`)
      setShowAllocate(false)
      closeMenu()
      loadData()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg || 'Allocation failed')
    }
  }

  async function handleUnoccupy() {
    if (!selectedSeat) return
    const alloc = allocBySeat[selectedSeat.id]
    if (!alloc) { toast.error('No active allocation found'); return }
    try {
      await allocationService.endAllocation(alloc.id)
      toast.success(`Seat ${selectedSeat.seatNumber} is now available`)
      closeMenu()
      loadData()
    } catch {
      toast.error('Failed to free seat')
    }
  }

  async function handleDelete() {
    if (!selectedSeat) return
    if (!confirm(`Delete seat ${selectedSeat.seatNumber}?`)) return
    try {
      await seatService.delete(selectedSeat.id)
      setSeats(prev => prev.filter(s => s.id !== selectedSeat.id))
      toast.success('Seat deleted')
      closeMenu()
    } catch { toast.error('Failed to delete seat') }
  }

  async function handleSetStatus(status: string) {
    if (!selectedSeat) return
    try {
      const updated = await seatService.update(selectedSeat.id, { status })
      setSeats(prev => prev.map(s => s.id === selectedSeat.id ? updated : s))
      toast.success(`Seat ${selectedSeat.seatNumber} set to ${status}`)
      closeMenu()
    } catch { toast.error('Failed to update seat') }
  }

  if (loading) return <LoadingSpinner />

  const counts = { AVAILABLE: 0, OCCUPIED: 0, MAINTENANCE: 0 }
  seats.forEach(s => { counts[s.status as keyof typeof counts]++ })

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {floor?.name || 'Seats'}
        </h1>
        <div className="relative">
          <button onClick={() => setShowAddMenu(!showAddMenu)} className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium transition-colors">
            + Add Seats
          </button>

          {showAddMenu && (
            <div ref={addMenuRef} className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-1 min-w-[160px] z-40">
              <button onClick={() => { setAddMode('bulk'); setShowAddMenu(false) }}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                Add Bulk
              </button>
              <button onClick={() => { setAddMode('single'); setShowAddMenu(false) }}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                Add Single
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-4 mb-6 text-sm">
        <span className="flex items-center gap-1 text-md text-gray-900 dark:text-white"><span className="w-3 h-3 rounded-full bg-green-500" /> Available: {counts.AVAILABLE}</span>
        <span className="flex items-center gap-1 text-md text-gray-900 dark:text-white"><span className="w-3 h-3 rounded-full bg-red-500" /> Occupied: {counts.OCCUPIED}</span>
        <span className="flex items-center gap-1 text-md text-gray-900 dark:text-white"><span className="w-3 h-3 rounded-full bg-yellow-500" /> Maintenance: {counts.MAINTENANCE}</span>
      </div>

      {addMode === 'bulk' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Number of seats to add</p>
          <div className="flex gap-2 items-start">
            <div className="w-40 space-y-1">
              <input
                value={bulkCount}
                onChange={e => { setBulkCount(e.target.value.replace(/\D/g, '')); setBulkError(null) }}
                className={`w-full px-3 py-2 rounded-lg border text-sm outline-none focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${bulkError ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                placeholder="e.g. 50"
                maxLength={3}
              />
              {bulkError && <p className="text-xs text-red-500">{bulkError}</p>}
            </div>
            <button onClick={addBulk} className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium whitespace-nowrap">Add</button>
            <button onClick={() => { setAddMode(null); setBulkCount(''); setBulkError(null) }} className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm font-medium">Cancel</button>
          </div>
          <p className="text-xs text-gray-400 mt-2">Seats will be numbered sequentially starting from the next available number. Max 100 at a time.</p>
        </div>
      )}

      {addMode === 'single' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Enter seat number:</p>
          <div className="flex gap-2">
            <input value={singleInput} onChange={e => setSingleInput(e.target.value)} className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm outline-none focus:border-primary-500 text-gray-900 dark:text-white" placeholder="e.g. A1" />
            <button onClick={addSingle} className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium">Add</button>
            <button onClick={() => { setAddMode(null); setSingleInput('') }} className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm font-medium">Cancel</button>
          </div>
        </div>
      )}

      {seats.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">No seats yet. Add seats to this floor.</div>
      ) : (
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
          {[...seats].sort((a, b) => Number(a.seatNumber) - Number(b.seatNumber)).map(seat => (
            <button
              key={seat.id}
              onClick={e => openMenu(seat, e)}
              className={`relative p-5 rounded-lg border text-center transition-all cursor-pointer
                ${statusColors[seat.status] || 'bg-gray-100 border-gray-200'}
                hover:ring-2 hover:ring-primary-400`}
            >
              <div className="text-xs font-semibold">{seat.seatNumber}</div>
              <div className="text-[9px] opacity-75 mt-0.5">{seat.status}</div>
            </button>
          ))}
        </div>
      )}

      {menuPos && selectedSeat && (
        <div
          ref={menuRef}
          style={{ position: 'fixed', top: menuPos.top, left: menuPos.left, zIndex: 50 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-1 min-w-[180px]"
        >
          <div className="px-3 py-2 text-xs font-semibold text-gray-400 dark:text-gray-500 border-b border-gray-100 dark:border-gray-700">
            {selectedSeat.seatNumber} — {selectedSeat.status}
          </div>

          {selectedSeat.status === 'AVAILABLE' && (
            <button onClick={() => { setShowAllocate(true); setMenuPos(null); triggerRef.current = null }}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              Allocate to Member
            </button>
          )}

          {selectedSeat.status === 'OCCUPIED' && (
            <button onClick={handleUnoccupy}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              Mark as Available
            </button>
          )}

          {selectedSeat.status === 'MAINTENANCE' && (
            <button onClick={() => handleSetStatus('AVAILABLE')}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              Set Available
            </button>
          )}

          {selectedSeat.status === 'AVAILABLE' && (
            <button onClick={() => handleSetStatus('MAINTENANCE')}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              Set Maintenance
            </button>
          )}

          {selectedSeat.status === 'OCCUPIED' && (
            <button onClick={() => handleSetStatus('MAINTENANCE')}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              Set Maintenance
            </button>
          )}

          <div className="border-t border-gray-100 dark:border-gray-700 my-1" />

          <button onClick={handleDelete}
            className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
            Delete Seat
          </button>
        </div>
      )}

      {showAllocate && (
        <AllocateMemberModal
          members={members}
          seatNumber={selectedSeat?.seatNumber || ''}
          onSelect={handleAllocate}
          onClose={() => setShowAllocate(false)}
        />
      )}
    </div>
  )
}

function AllocateMemberModal({
  members,
  seatNumber,
  onSelect,
  onClose,
}: {
  members: Member[]
  seatNumber: string
  onSelect: (memberId: string) => void
  onClose: () => void
}) {
  const [search, setSearch] = useState('')

  const feeStatusBadge: Record<string, string> = {
    PAID: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    UNPAID: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    PARTIAL: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  }

  const filtered = members.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.phone.includes(search)
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 w-full max-w-md max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white">Allocate — Seat {seatNumber}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-lg leading-none">&times;</button>
        </div>

        <div className="px-4 py-3">
          <input
            autoFocus
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or phone..."
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm outline-none focus:border-primary-500 text-gray-900 dark:text-white"
          />
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-3 space-y-1">
          {filtered.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-6">No members found</p>
          ) : (
            filtered.map(m => (
              <button
                key={m.id}
                onClick={() => onSelect(m.id)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  m.feeStatus === 'PAID'
                    ? 'hover:bg-gray-50 dark:hover:bg-gray-700'
                    : 'bg-amber-50 dark:bg-amber-900/10 hover:bg-amber-100 dark:hover:bg-amber-900/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900 dark:text-white">{m.name}</span>
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${feeStatusBadge[m.feeStatus] || ''}`}>{m.feeStatus}</span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{m.phone}{m.email ? ` · ${m.email}` : ''}</div>
                {m.feeStatus !== 'PAID' && (
                  <div className="text-[11px] text-amber-600 dark:text-amber-400 mt-1">⚠ Fee not paid — allocation blocked</div>
                )}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
