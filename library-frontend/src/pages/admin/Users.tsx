import { useState, useEffect } from 'react'
import { adminService } from '../../services/adminService'
import toast from 'react-hot-toast'

interface AdminUser {
  id: string
  name: string
  email: string
  phone: string
  role: string
  enabled: boolean
  createdAt: string
}

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<AdminUser | null>(null)

  useEffect(() => {
    adminService.getUsers()
      .then(data => {
        const mapped = (data as Array<Record<string, unknown>>).map(u => ({
          id: String(u.id || ''),
          name: String(u.name || ''),
          email: String(u.email || ''),
          phone: String(u.phone || ''),
          role: String(u.role || 'OWNER'),
          enabled: Boolean(u.enabled),
          createdAt: String(u.createdAt || new Date().toISOString()),
        }))
        setUsers(mapped)
      })
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = users.filter(u =>
    !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <div className="text-center py-12 text-gray-500">Loading...</div>

  if (selected) {
    return (
      <div>
        <button onClick={() => setSelected(null)} className="mb-4 text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400">&larr; Back to Users</button>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 max-w-lg">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{selected.name}</h2>
          <div className="space-y-3">
            <div><p className="text-xs text-gray-500 dark:text-gray-400">Email</p><p className="text-sm font-medium text-gray-900 dark:text-white">{selected.email}</p></div>
            <div><p className="text-xs text-gray-500 dark:text-gray-400">Phone</p><p className="text-sm font-medium text-gray-900 dark:text-white">{selected.phone}</p></div>
            <div><p className="text-xs text-gray-500 dark:text-gray-400">Role</p><p className="text-sm font-medium text-gray-900 dark:text-white">{selected.role}</p></div>
            <div><p className="text-xs text-gray-500 dark:text-gray-400">Status</p><p className="text-sm font-medium text-gray-900 dark:text-white">{selected.enabled ? 'Enabled' : 'Disabled'}</p></div>
            <div><p className="text-xs text-gray-500 dark:text-gray-400">Joined</p><p className="text-sm font-medium text-gray-900 dark:text-white">{new Date(selected.createdAt).toLocaleDateString()}</p></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Users</h1>

      <input value={search} onChange={e => setSearch(e.target.value)} className="mb-4 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm outline-none focus:border-primary-500 text-gray-900 dark:text-white w-60" placeholder="Search by name or email..." />

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">No users found</div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Email</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Phone</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{u.name}</td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{u.email}</td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{u.phone}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${u.enabled ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'}`}>
                      {u.enabled ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => setSelected(u)} className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs hover:bg-gray-200">View</button>
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
