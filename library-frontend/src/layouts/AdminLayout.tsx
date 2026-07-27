import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import PageTransition from '../components/PageTransition'

const navItems = [
  { label: 'Dashboard', to: 'dashboard' },
  { label: 'Subscriptions', to: 'subscriptions' },
  { label: 'Libraries', to: 'libraries' },
  { label: 'Users', to: 'users' },
  { label: 'Payments', to: 'payments' },
]

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <Sidebar title="Admin Panel" navItems={navItems} basePath="/admin" />
      <main className="flex-1 p-4 md:p-6 pt-16 lg:pt-6 overflow-x-hidden">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>
    </div>
  )
}
