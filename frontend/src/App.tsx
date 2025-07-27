import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from 'sonner'
import { useAuth } from './stores/authStore'

// Layouts
import { AuthLayout } from './components/layout/AuthLayout'
import { DashboardLayout } from './components/layout/DashboardLayout'

// Pages
import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'
import { RegisterStep2Page } from './pages/auth/RegisterStep2Page'
import { UserDashboardPage } from './pages/dashboard/UserDashboardPage'
import { AttendantDashboardPage } from './pages/dashboard/AttendantDashboardPage'
import { AdminDashboardPage } from './pages/dashboard/AdminDashboardPage'
import { BookingCreatePage } from './pages/bookings/BookingCreatePage'
import { BookingListPage } from './pages/bookings/BookingListPage'
import { UserListPage } from './pages/users/UserListPage'
import { UserCreatePage } from './pages/users/UserCreatePage'
import { UserDetailPage } from './pages/users/UserDetailPage'
import { UserEditPage } from './pages/users/UserEditPage'
import { UserPendingPage } from './pages/users/UserPendingPage'
import { UserBookingPage } from './pages/users/UserBookingPage'
import ChairListPage from './pages/chairs/ChairListPage'
import ChairCreatePage from './pages/chairs/ChairCreatePage'
import ChairDetailPage from './pages/chairs/ChairDetailPage'
import ChairEditPage from './pages/chairs/ChairEditPage'
import { AvailabilityListPage } from './pages/availability/AvailabilityListPage'

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) => {
  const { isAuthenticated, user } = useAuth()

  console.log('ProtectedRoute - isAuthenticated:', isAuthenticated)
  console.log('ProtectedRoute - user:', user)
  console.log('ProtectedRoute - allowedRoles:', allowedRoles)
  console.log('ProtectedRoute - current pathname:', window.location.pathname)

  if (!isAuthenticated) {
    console.log('ProtectedRoute - Usuário não autenticado, redirecionando para login')
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    console.log('ProtectedRoute - Usuário sem permissão, redirecionando para dashboard')
    console.log('ProtectedRoute - User role:', user.role)
    console.log('ProtectedRoute - Allowed roles:', allowedRoles)
    console.log('ProtectedRoute - Role check:', allowedRoles.includes(user.role))
    // Redirecionar para o dashboard apropriado baseado no role
    switch (user.role) {
      case 'usuario':
        return <Navigate to="/dashboard" replace />
      case 'atendente':
        return <Navigate to="/dashboard/attendant" replace />
      case 'admin':
        return <Navigate to="/dashboard/admin" replace />
      default:
        return <Navigate to="/login" replace />
    }
  }

  console.log('ProtectedRoute - Acesso permitido')
  return <>{children}</>
}

// Dashboard Route Component
const DashboardRoute = () => {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Redirecionar baseado no role
  switch (user.role) {
    case 'usuario':
      return <Navigate to="/dashboard" replace />
    case 'atendente':
      return <Navigate to="/dashboard/attendant" replace />
    case 'admin':
      return <Navigate to="/dashboard/admin" replace />
    default:
      return <Navigate to="/login" replace />
  }
}

// Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-background">
          <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={
              <AuthLayout>
                <LoginPage />
              </AuthLayout>
            } />
            <Route path="/register" element={
              <AuthLayout>
                <RegisterPage />
              </AuthLayout>
            } />
            <Route path="/register/step2" element={
              <AuthLayout>
                <RegisterStep2Page />
              </AuthLayout>
            } />

            {/* Dashboard Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardLayout variant="minimal">
                  <UserDashboardPage />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/dashboard/attendant" element={
              <ProtectedRoute allowedRoles={['atendente', 'admin']}>
                <DashboardLayout>
                  <AttendantDashboardPage />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/dashboard/admin" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardLayout>
                  <AdminDashboardPage />
                </DashboardLayout>
              </ProtectedRoute>
            } />

            {/* Booking Routes */}
            <Route path="/bookings" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <BookingListPage />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/bookings/create" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <BookingCreatePage />
                </DashboardLayout>
              </ProtectedRoute>
            } />

            {/* User Management Routes */}
            <Route path="/users" element={
              <ProtectedRoute allowedRoles={['atendente', 'admin']}>
                <DashboardLayout>
                  <UserListPage />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/users/booking" element={
              <ProtectedRoute allowedRoles={['usuario']}>
                <DashboardLayout variant="minimal">
                  <UserBookingPage />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/users/pending" element={
              <ProtectedRoute allowedRoles={['atendente', 'admin']}>
                <DashboardLayout>
                  <UserPendingPage />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/users/create" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardLayout>
                  <UserCreatePage />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/users/:id/edit" element={
              <ProtectedRoute allowedRoles={['atendente', 'admin']}>
                <DashboardLayout>
                  <UserEditPage />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/users/:id" element={
              <ProtectedRoute allowedRoles={['atendente', 'admin']}>
                <DashboardLayout>
                  <UserDetailPage />
                </DashboardLayout>
              </ProtectedRoute>
            } />

            {/* Chair Management Routes (Admin Only) */}
            <Route path="/chairs" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardLayout>
                  <ChairListPage />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/chairs/create" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardLayout>
                  <ChairCreatePage />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/chairs/:id" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardLayout>
                  <ChairDetailPage />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/chairs/:id/edit" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardLayout>
                  <ChairEditPage />
                </DashboardLayout>
              </ProtectedRoute>
            } />

            {/* Availability Management Routes (Admin Only) */}
            <Route path="/availability" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardLayout>
                  <AvailabilityListPage />
                </DashboardLayout>
              </ProtectedRoute>
            } />

            {/* Default redirect */}
            <Route path="/" element={<DashboardRoute />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
      <Toaster 
        position="top-right"
        richColors
        closeButton
        duration={4000}
      />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

export default App
