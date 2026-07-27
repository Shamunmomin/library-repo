import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { AuthGuard } from './guard/AuthGuard'
import { ROUTES } from './utils/constants'
import LoadingSpinner from './components/LoadingSpinner'

const Login = lazy(() => import('./pages/auth/Login'))
const Register = lazy(() => import('./pages/auth/Register'))
const Splash = lazy(() => import('./pages/shared/Splash'))
const Subscribe = lazy(() => import('./pages/shared/Subscribe'))
const OwnerDashboard = lazy(() => import('./pages/owner/Dashboard'))
const OwnerLibrary = lazy(() => import('./pages/owner/Library'))
const OwnerFloors = lazy(() => import('./pages/owner/Floors'))
const OwnerSeats = lazy(() => import('./pages/owner/Seats'))
const OwnerMembers = lazy(() => import('./pages/owner/Members'))
const OwnerAllocations = lazy(() => import('./pages/owner/Allocations'))
const OwnerReports = lazy(() => import('./pages/owner/Reports'))
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'))
const AdminLibraries = lazy(() => import('./pages/admin/Libraries'))
const AdminSubscriptions = lazy(() => import('./pages/admin/Subscriptions'))
const AdminUsers = lazy(() => import('./pages/admin/Users'))
const AdminPayments = lazy(() => import('./pages/admin/Payments'))
const OwnerLayout = lazy(() => import('./layouts/OwnerLayout'))
const AdminLayout = lazy(() => import('./layouts/AdminLayout'))

function SuspenseWrapper({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <SuspenseWrapper>
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
        </SuspenseWrapper>
      </ThemeProvider>
    </AuthProvider>
  )
}
