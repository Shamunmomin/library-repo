import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import PageTransition from '../components/PageTransition'

const navItems = [
  { label: 'Dashboard', to: 'dashboard' },
  { label: 'Library', to: 'library' },
  { label: 'Floors', to: 'floors' },
  { label: 'Members', to: 'members' },
  { label: 'Allocations', to: 'allocations' },
  { label: 'Reports', to: 'reports' },
]

export default function OwnerLayout() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <Sidebar title="Owner Panel" navItems={navItems} basePath="/owner" />
      <main className="flex-1 p-4 md:p-6 pt-16 lg:pt-6 overflow-x-hidden">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>
    </div>
  )
}
