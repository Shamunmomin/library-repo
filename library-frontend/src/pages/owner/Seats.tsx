import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { seatService } from '../../services/seatService'
import { floorService } from '../../services/floorService'
import type { Seat, Floor } from '../../types'
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
  const [bulkInput, setBulkInput] = useState('')
  const [showBulk, setShowBulk] = useState(false)

  useEffect(() => {
    if (!floorId) return
    Promise.all([
      floorService.getById(floorId),
      seatService.getByFloor(floorId),
    ]).then(([f, s]) => {
      setFloor(f)
      setSeats(s)
    }).catch(() => toast.error('Failed to load seats'))
    .finally(() => setLoading(false))
  }, [floorId])

  async function addBulk() {
    if (!floorId || !bulkInput.trim()) return
    const numbers = bulkInput.split(',').map(s => s.trim()).filter(Boolean)
    if (numbers.length === 0) { toast.error('Enter at least one seat number'); return }
    try {
      const created = await seatService.createBulk(floorId, numbers)
      setSeats(prev => [...prev, ...created])
      setBulkInput('')
      setShowBulk(false)
      toast.success(`${created.length} seats added`)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg || 'Failed to add seats')
    }
  }

  async function toggleStatus(seat: Seat) {
    const nextStatus = seat.status === 'AVAILABLE' ? 'MAINTENANCE' : 'AVAILABLE'
    try {
      const updated = await seatService.update(seat.id, { status: nextStatus })
      setSeats(prev => prev.map(s => s.id === seat.id ? updated : s))
    } catch { toast.error('Failed to update seat') }
  }

  async function deleteSeat(id: string) {
    if (!confirm('Delete this seat?')) return
    try {
      await seatService.delete(id)
      setSeats(prev => prev.filter(s => s.id !== id))
      toast.success('Seat deleted')
    } catch { toast.error('Failed to delete seat') }
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
        <button onClick={() => setShowBulk(!showBulk)} className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium transition-colors">
          + Add Seats
        </button>
      </div>

      <div className="flex gap-4 mb-6 text-sm">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500" /> Available: {counts.AVAILABLE}</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500" /> Occupied: {counts.OCCUPIED}</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-yellow-500" /> Maintenance: {counts.MAINTENANCE}</span>
      </div>

      {showBulk && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Enter seat numbers separated by commas:</p>
          <div className="flex gap-2">
            <input value={bulkInput} onChange={e => setBulkInput(e.target.value)} className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm outline-none focus:border-primary-500 text-gray-900 dark:text-white" placeholder="A1, A2, A3, B1, B2" />
            <button onClick={addBulk} className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium">Add</button>
            <button onClick={() => setShowBulk(false)} className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm font-medium">Cancel</button>
          </div>
        </div>
      )}

      {seats.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">No seats yet. Add seats to this floor.</div>
      ) : (
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
          {seats.map(seat => (
            <div key={seat.id} className="relative group">
              <button
                onClick={() => toggleStatus(seat)}
                className={`w-full p-2 rounded-lg border text-xs font-medium text-center transition-all cursor-pointer
                  ${statusColors[seat.status] || 'bg-gray-100 border-gray-200'}
                  hover:ring-2 hover:ring-primary-400`}
              >
                {seat.seatNumber}
              </button>
              <button
                onClick={() => deleteSeat(seat.id)}
                className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-white text-[8px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
