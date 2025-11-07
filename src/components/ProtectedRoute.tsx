import { Navigate, Outlet } from 'react-router-dom'
import useAuthStore from '@/stores/auth.store'
import { UserRole } from '@/types'

interface ProtectedRouteProps {
  allowedRoles?: UserRole[]
}

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirect to a "not authorized" page or dashboard
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
