import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import PageTransition from '../components/PageTransition'
import SubscriptionExpiryBanner from '../components/SubscriptionExpiryBanner'
import { libraryService } from '../services/libraryService'

const navItems = [
  { label: 'Dashboard', to: 'dashboard' },
  { label: 'Library', to: 'library' },
  { label: 'Floors', to: 'floors' },
  { label: 'Members', to: 'members' },
  { label: 'Allocations', to: 'allocations' },
  { label: 'Reports', to: 'reports' },
]

export default function OwnerLayout() {
  const [libraryName, setLibraryName] = useState('Owner Panel')

  useEffect(() => {
    libraryService.getMyLibrary()
      .then(lib => setLibraryName(lib.name))
      .catch(() => {})
  }, [])

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 flex overflow-hidden">
      <Sidebar title={libraryName} navItems={navItems} basePath="/owner" />
      <main className="flex-1 p-4 md:p-6 pt-16 lg:pt-6 overflow-y-auto">
        <SubscriptionExpiryBanner />
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>
    </div>
  )
}
