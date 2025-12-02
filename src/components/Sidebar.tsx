import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Shield,
  Settings,
  Clock,
  Database,
} from 'lucide-react'
import useAuthStore from '@/stores/auth.store'

const Sidebar = () => {
  const location = useLocation()
  const { user } = useAuthStore()
  const isAdmin = user?.role === 'Admin'

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: CalendarDays, label: 'Scales', path: '/scales' },
    { icon: Users, label: 'Military', path: '/military' },
  ]

  const adminItems = [
    { icon: Shield, label: 'Permissions', path: '/admin/permissions' },
    { icon: Users, label: 'Users', path: '/admin/users' },
    { icon: CalendarDays, label: 'Scales', path: '/admin/scales' },
    {
      icon: Clock,
      label: 'Unavailability Types',
      path: '/admin/unavailability-types',
    },
    { icon: Database, label: 'Configurations', path: '/admin/configurations' },
  ]

  return (
    <aside className="fixed left-0 top-14 z-30 hidden h-[calc(100vh-3.5rem)] w-64 border-r bg-background md:block">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Menu
          </h2>
          <div className="space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center rounded-md px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground',
                  location.pathname === item.path
                    ? 'bg-accent text-accent-foreground'
                    : 'transparent',
                )}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        {isAdmin && (
          <div className="px-3 py-2">
            <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
              Admin
            </h2>
            <div className="space-y-1">
              {adminItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex items-center rounded-md px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground',
                    location.pathname === item.path
                      ? 'bg-accent text-accent-foreground'
                      : 'transparent',
                  )}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}

export default Sidebar
