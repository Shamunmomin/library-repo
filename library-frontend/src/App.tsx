import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { AuthGuard } from './guard/AuthGuard'
import { ROUTES } from './utils/constants'

import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Splash from './pages/shared/Splash'
import Subscribe from './pages/shared/Subscribe'
import OwnerDashboard from './pages/owner/Dashboard'
import OwnerLibrary from './pages/owner/Library'
import OwnerFloors from './pages/owner/Floors'
import OwnerSeats from './pages/owner/Seats'
import OwnerMembers from './pages/owner/Members'
import OwnerAllocations from './pages/owner/Allocations'
import OwnerReports from './pages/owner/Reports'
import AdminDashboard from './pages/admin/Dashboard'
import AdminLibraries from './pages/admin/Libraries'
import AdminSubscriptions from './pages/admin/Subscriptions'
import AdminUsers from './pages/admin/Users'
import AdminPayments from './pages/admin/Payments'
import OwnerLayout from './layouts/OwnerLayout'
import AdminLayout from './layouts/AdminLayout'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Navigate to={ROUTES.LOGIN} replace />} />
        <Route path={ROUTES.LOGIN} element={<Login />} />
        <Route path={ROUTES.REGISTER} element={<Register />} />

        <Route
          path={ROUTES.SPLASH}
          element={
            <AuthGuard>
              <Splash />
            </AuthGuard>
          }
        />
        <Route
          path={ROUTES.SUBSCRIBE}
          element={
            <AuthGuard>
              <Subscribe />
            </AuthGuard>
          }
        />

        <Route
          path="/owner"
          element={
            <AuthGuard requiredRole="OWNER">
              <OwnerLayout />
            </AuthGuard>
          }
        >
          <Route index element={<Navigate to={ROUTES.OWNER_DASHBOARD} replace />} />
          <Route path="dashboard" element={<OwnerDashboard />} />
          <Route path="library" element={<OwnerLibrary />} />
          <Route path="floors" element={<OwnerFloors />} />
          <Route path="floors/:floorId/seats" element={<OwnerSeats />} />
          <Route path="members" element={<OwnerMembers />} />
          <Route path="allocations" element={<OwnerAllocations />} />
          <Route path="reports" element={<OwnerReports />} />
        </Route>

        <Route
          path="/admin"
          element={
            <AuthGuard requiredRole="ADMIN">
              <AdminLayout />
            </AuthGuard>
          }
        >
          <Route index element={<Navigate to={ROUTES.ADMIN_DASHBOARD} replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="libraries" element={<AdminLibraries />} />
          <Route path="subscriptions" element={<AdminSubscriptions />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="payments" element={<AdminPayments />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}
