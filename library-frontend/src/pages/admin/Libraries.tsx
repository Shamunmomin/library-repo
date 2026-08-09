import { useState, useEffect } from 'react'
import { adminService } from '../../services/adminService'
import type { LibraryDetail } from '../../types'
import LoadingSpinner from '../../components/LoadingSpinner'
import ProtectedImage from '../../components/ProtectedImage'
import toast from 'react-hot-toast'

export default function AdminLibraries() {
  const [libraries, setLibraries] = useState<LibraryDetail[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'active' | 'expired'>('all')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<LibraryDetail | null>(null)

  useEffect(() => { loadLibraries() }, [filter])

  async function loadLibraries() {
    setLoading(true)
    try {
      const f = filter === 'all' ? undefined : filter
      const data = await adminService.getLibraries(f)
      setLibraries(data)
    } catch { toast.error('Failed to load libraries') }
    finally { setLoading(false) }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this library? This action cannot be undone.')) return
    try { await adminService.deleteLibrary(id); toast.success('Library deleted'); loadLibraries(); setSelected(null) }
    catch { toast.error('Failed to delete library') }
  }

  const filtered = libraries.filter(l =>
    !search || l.name.toLowerCase().includes(search.toLowerCase()) || l.ownerName.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <LoadingSpinner />

  if (selected) {
    return (
      <div>
        <button onClick={() => setSelected(null)} className="mb-4 text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400">&larr; Back to Libraries</button>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 max-w-2xl">
          <div className="flex items-start gap-4 mb-6">
            <ProtectedImage src={selected.icon} alt="" className="w-16 h-16 rounded-lg object-cover" />
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selected.name}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{selected.address}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{selected.phone}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <DetailField label="Owner" value={selected.ownerName} />
            <DetailField label="Owner Email" value={selected.ownerEmail} />
            <DetailField label="Owner Phone" value={selected.ownerPhone} />
            <DetailField label="Subscription" value={`${selected.subscriptionPackage} - ${selected.subscriptionStatus}`} />
            <DetailField label="Floors/Rooms" value={String(selected.floorCount)} />
            <DetailField label="Total Seats" value={String(selected.totalSeats)} />
            <DetailField label="Occupied Seats" value={String(selected.occupiedSeats)} />
            <DetailField label="Created" value={new Date(selected.createdAt).toLocaleDateString()} />
          </div>
          <button onClick={() => handleDelete(selected.id)} className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium">
            Delete Library
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Libraries</h1>

      <div className="flex flex-wrap gap-3 mb-4">
        <input value={search} onChange={e => setSearch(e.target.value)} className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm outline-none focus:border-primary-500 text-gray-900 dark:text-white w-60" placeholder="Search library or owner..." />
        {(['all', 'active', 'expired'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === f ? 'bg-primary-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700'}`}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">No libraries found</div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Owner</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Subscription</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Floors/Rooms</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Seats</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(l => (
                <tr key={l.id} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{l.name}</td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{l.ownerName}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${l.subscriptionStatus === 'ACTIVE' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'}`}>
                      {l.subscriptionStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{l.floorCount}</td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{l.occupiedSeats}/{l.totalSeats}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => setSelected(l)} className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs hover:bg-gray-200">View</button>
                      <button onClick={() => handleDelete(l.id)} className="px-2 py-1 rounded bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs hover:bg-red-200">Del</button>
                    </div>
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

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-sm font-medium text-gray-900 dark:text-white">{value}</p>
    </div>
  )
}
