import { useState, useEffect } from 'react'
import { libraryService } from '../../services/libraryService'
import type { Library } from '../../types'
import LoadingSpinner from '../../components/LoadingSpinner'
import toast from 'react-hot-toast'

export default function OwnerLibrary() {
  const [library, setLibrary] = useState<Library | null | undefined>(undefined)
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [icon, setIcon] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    libraryService.getMyLibrary()
      .then(setLibrary)
      .catch(() => setLibrary(null))
  }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !address.trim() || !phone.trim()) {
      toast.error('All fields are required')
      return
    }
    setIsSubmitting(true)
    try {
      const lib = await libraryService.create(name.trim(), address.trim(), phone.trim(), icon || undefined)
      setLibrary(lib)
      toast.success('Library created successfully!')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg || 'Failed to create library')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (library === undefined) {
    return <LoadingSpinner />
  }

  if (library) {
    return (
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">My Library</h1>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          {library.icon && (
            <img src={library.icon} alt="Library" className="w-20 h-20 rounded-xl object-cover mb-4" />
          )}
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{library.name}</h2>
          <div className="space-y-1 text-sm text-gray-500 dark:text-gray-400">
            <p>📍 {library.address}</p>
            <p>📞 {library.phone}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Create Your Library</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6">Set up your library to get started</p>

      <form onSubmit={handleCreate} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Library Name</label>
          <input value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm outline-none focus:border-primary-500" placeholder="My Study Library" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
          <input value={address} onChange={e => setAddress(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm outline-none focus:border-primary-500" placeholder="123 Main St, City" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
          <input value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm outline-none focus:border-primary-500" placeholder="+1 234 567 890" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Icon (optional)</label>
          <input type="file" accept="image/*" onChange={e => setIcon(e.target.files?.[0] || null)} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 dark:file:bg-primary-900/30 file:text-primary-700 cursor-pointer" />
        </div>
        <button type="submit" disabled={isSubmitting} className="w-full py-2.5 px-4 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-medium text-sm transition-colors disabled:opacity-50">
          {isSubmitting ? 'Creating...' : 'Create Library'}
        </button>
      </form>
    </div>
  )
}
