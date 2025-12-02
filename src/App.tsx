import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Layout from './components/Layout'
import LoginPage from './pages/Login'
import DashboardPage from './pages/Dashboard'
import ScalesListPage from './pages/scales/ScalesListPage'
import ScaleDetailsPage from './pages/scales/ScaleDetailsPage'
import MilitaryListPage from './pages/military/MilitaryListPage'
import MilitaryProfilePage from './pages/military/MilitaryProfilePage'
import AdminUsersPage from './pages/admin/AdminUsersPage'
import AdminScalesPage from './pages/admin/AdminScalesPage'
import AdminPermissionsPage from './pages/admin/AdminPermissionsPage'
import AdminUnavailabilityTypesPage from './pages/admin/AdminUnavailabilityTypesPage'
import NotFound from './pages/NotFound'
import { ProtectedRoute } from './components/ProtectedRoute'
import useAuthStore from './stores/auth.store'

const App = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  return (
    <BrowserRouter>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/" /> : <LoginPage />}
          />

          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/scales" element={<ScalesListPage />} />
              <Route path="/scales/:scaleId" element={<ScaleDetailsPage />} />
              <Route path="/military" element={<MilitaryListPage />} />
              <Route
                path="/military/:militaryId"
                element={<MilitaryProfilePage />}
              />
            </Route>
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
            <Route element={<Layout />}>
              <Route path="/admin/users" element={<AdminUsersPage />} />
              <Route path="/admin/scales" element={<AdminScalesPage />} />
              <Route
                path="/admin/permissions"
                element={<AdminPermissionsPage />}
              />
              <Route
                path="/admin/unavailability-types"
                element={<AdminUnavailabilityTypesPage />}
              />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </BrowserRouter>
  )
}

export default App
