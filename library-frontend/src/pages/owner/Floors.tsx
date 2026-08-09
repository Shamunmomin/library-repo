import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { floorService } from '../../services/floorService'
import type { Floor } from '../../types'
import LoadingSpinner from '../../components/LoadingSpinner'
import toast from 'react-hot-toast'
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline'

export default function OwnerFloors() {
  const navigate = useNavigate()
  const [floors, setFloors] = useState<Floor[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<Floor | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => { loadFloors() }, [])

  async function loadFloors() {
    setLoading(true)
    try {
      const data = await floorService.getMyFloors()
      setFloors(data)
    } catch { toast.error('Failed to load floors') }
    finally { setLoading(false) }
  }

  function resetForm() { setName(''); setDescription(''); setEditId(null); setShowForm(false) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { toast.error('Floor/Room name is required'); return }
    try {
      if (editId) {
        await floorService.update(editId, name.trim(), description.trim())
        toast.success('Floor/Room updated')
      } else {
        await floorService.create(name.trim(), description.trim())
        toast.success('Floor/Room created')
      }
      resetForm(); loadFloors()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg || 'Operation failed')
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await floorService.delete(deleteTarget.id)
      toast.success('Floor/Room deleted')
      setDeleteTarget(null)
      loadFloors()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg || 'Failed to delete floor/Room')
    } finally { setDeleting(false) }
  }

  function startEdit(floor: Floor) {
    setName(floor.name); setDescription(floor.description || ''); setEditId(floor.id); setShowForm(true)
  }

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Floors/Rooms</h1>
        <button onClick={() => { resetForm(); setShowForm(true) }} className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium transition-colors">
          + Add Floor/Room
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-6 space-y-3">
          <input value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm outline-none focus:border-primary-500 text-gray-900 dark:text-white" placeholder="Floor name (e.g. Ground Floor)" />
          <input value={description} onChange={e => setDescription(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm outline-none focus:border-primary-500 text-gray-900 dark:text-white" placeholder="Description (optional)" />
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium">{editId ? 'Update' : 'Create'}</button>
            <button type="button" onClick={resetForm} className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm font-medium">Cancel</button>
          </div>
        </form>
      )}

      {floors.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">No floors/rooms yet. Add your first floor!</div>
      ) : (
        <div className="grid gap-4">
          {floors.map(floor => (
            <div key={floor.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Room - {floor.name}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">{floor.description}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{floor.seatCount} seat{floor.seatCount !== 1 ? 's' : ''}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => navigate(`/owner/floors/${floor.id}/seats`)} className="px-3 py-1.5 rounded-lg bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs font-medium hover:bg-primary-100 transition-colors">
                  Manage Seats
                </button>
                <button onClick={() => startEdit(floor)} title="Edit" aria-label="Edit" className="inline-flex items-center px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-medium hover:bg-gray-200 transition-colors">
                  <PencilIcon className="h-4 w-4 sm:hidden" />
                  <span className="hidden sm:inline">Edit</span>
                </button>
                <button onClick={() => setDeleteTarget(floor)} title="Delete" aria-label="Delete" className="inline-flex items-center px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 text-xs font-medium hover:bg-red-100 transition-colors">
                  <TrashIcon className="h-4 w-4 sm:hidden" />
                  <span className="hidden sm:inline">Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => !deleting && setDeleteTarget(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 w-full max-w-md mx-4 shadow-xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Delete Floor/Room</h2>
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
              Are you sure you want to delete floor/rooms- <strong className="text-gray-900 dark:text-white">{deleteTarget.name}</strong>?
            </p>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              All <strong className="text-red-600 dark:text-red-400">{deleteTarget.seatCount} seat{deleteTarget.seatCount !== 1 ? 's' : ''}</strong> under this floor will also be permanently deleted.
            </p>
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">This action cannot be undone.</p>
            <div className="mt-5 flex gap-3 justify-end">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm font-medium hover:bg-gray-200 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium disabled:opacity-50 transition-colors"
              >
                {deleting ? 'Deleting...' : 'Delete Floor/Room'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
