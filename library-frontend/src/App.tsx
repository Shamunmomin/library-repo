import { lazy, Suspense, type ReactNode } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { OnboardingProvider } from './context/OnboardingContext'
import { ThemeProvider } from './context/ThemeContext'
import { AuthGuard } from './guard/AuthGuard'
import { GuestGuard } from './guard/GuestGuard'
import { OnboardingGuard } from './guard/OnboardingGuard'
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
const OwnerExpiredMembers = lazy(() => import('./pages/owner/ExpiredMembers'))
const OwnerAllocations = lazy(() => import('./pages/owner/Allocations'))
const OwnerReports = lazy(() => import('./pages/owner/Reports'))
const OwnerMemberPayments = lazy(() => import('./pages/owner/MemberPaymentHistory'))
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'))
const AdminLibraries = lazy(() => import('./pages/admin/Libraries'))
const AdminSubscriptions = lazy(() => import('./pages/admin/Subscriptions'))
const AdminUsers = lazy(() => import('./pages/admin/Users'))
const AdminPayments = lazy(() => import('./pages/admin/Payments'))
const OwnerLayout = lazy(() => import('./layouts/OwnerLayout'))
const AdminLayout = lazy(() => import('./layouts/AdminLayout'))
const AuthLayout = lazy(() => import('./layouts/AuthLayout'))

function SuspenseWrapper({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
}

function BootstrapGate({ children }: { children: ReactNode }) {
  const { isBootstrapping } = useAuth()
  if (isBootstrapping) return <Splash />
  return <>{children}</>
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <OnboardingProvider>
          <SuspenseWrapper>
            <BootstrapGate>
              <Routes>
                <Route path="/" element={<Navigate to={ROUTES.LOGIN} replace />} />
                <Route
                  path={ROUTES.LOGIN}
                  element={
                    <GuestGuard>
                      <AuthLayout><Login /></AuthLayout>
                    </GuestGuard>
                  }
                />
                <Route
                  path={ROUTES.REGISTER}
                  element={
                    <GuestGuard>
                      <AuthLayout><Register /></AuthLayout>
                    </GuestGuard>
                  }
                />

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
                      <OnboardingGuard allowedSteps={['SUBSCRIBE', 'PENDING_REVIEW']}>
                        <Subscribe />
                      </OnboardingGuard>
                    </AuthGuard>
                  }
                />

                <Route
                  path="/owner"
                  element={
                    <AuthGuard requiredRole="OWNER">
                      <OnboardingGuard allowedSteps={['SETUP_LIBRARY', 'DASHBOARD']}>
                        <OwnerLayout />
                      </OnboardingGuard>
                    </AuthGuard>
                  }
                >
                  <Route index element={<Navigate to={ROUTES.OWNER_DASHBOARD} replace />} />
                  <Route path="dashboard" element={<OwnerDashboard />} />
                  <Route path="library" element={<OwnerLibrary />} />
                  <Route path="floors" element={<OwnerFloors />} />
                  <Route path="floors/:floorId/seats" element={<OwnerSeats />} />
                  <Route path="members" element={<OwnerMembers />} />
                  <Route path="expired-members" element={<OwnerExpiredMembers />} />
                  <Route path="allocations" element={<OwnerAllocations />} />
                  <Route path="reports" element={<OwnerReports />} />
                  <Route path="members/:memberId/payments" element={<OwnerMemberPayments />} />
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
            </BootstrapGate>
          </SuspenseWrapper>
        </OnboardingProvider>
      </ThemeProvider>
    </AuthProvider>
  )
}
