import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './store/AuthProvider';
import { ThemeProvider } from './store/ThemeProvider';
import { ProtectedRoute } from './components/ProtectedRoute';
import { GuestRoute } from './components/GuestRoute';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { OwnerDashboard } from './pages/owner/OwnerDashboard';
import { useAuth } from './hooks/useAuth';
import { useTheme } from './hooks/useTheme';
import { Role } from './types/auth';

function RootRedirect() {
  const { isAuthenticated, isLoading, getDashboardPath } = useAuth();
  const { colors } = useTheme();

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${colors.bg.secondary}`}>
        <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${colors.spinner}`}></div>
      </div>
    );
  }

  return <Navigate to={isAuthenticated ? getDashboardPath() : '/login'} replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <GuestRoute>
            <Login />
          </GuestRoute>
        }
      />
      <Route
        path="/register"
        element={
          <GuestRoute>
            <Register />
          </GuestRoute>
        }
      />
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={[Role.SUPER_ADMIN]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={[Role.LIBRARY_OWNER]}>
            <OwnerDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<RootRedirect />} />
      <Route path="*" element={<RootRedirect />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Toaster position="top-right" />
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
