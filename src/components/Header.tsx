import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import {
  Menu,
  LogOut,
  LayoutDashboard,
  Users,
  CalendarDays,
  Shield,
  Clock,
  Database,
} from 'lucide-react'
import useAuthStore from '@/stores/auth.store'

export const Header = () => {
  const location = useLocation()
  const { user, logout } = useAuthStore()
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
    <header className="fixed top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4 md:px-6">
        <div className="mr-4 hidden md:flex">
          <Link to="/" className="mr-6 flex items-center space-x-2">
            <Shield className="h-6 w-6" />
            <span className="hidden font-bold sm:inline-block">
              Sistema de Escala
            </span>
          </Link>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0">
            <div className="px-7">
              <Link to="/" className="flex items-center" onClick={() => {}}>
                <Shield className="mr-2 h-4 w-4" />
                <span className="font-bold">Sistema de Escala</span>
              </Link>
            </div>
            <div className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
              <div className="flex flex-col space-y-3">
                <h4 className="font-medium">Menu</h4>
                {menuItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      'text-muted-foreground hover:text-primary',
                      location.pathname === item.path &&
                        'text-primary font-medium',
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
              {isAdmin && (
                <div className="flex flex-col space-y-3 mt-6">
                  <h4 className="font-medium">Admin</h4>
                  {adminItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={cn(
                        'text-muted-foreground hover:text-primary',
                        location.pathname === item.path &&
                          'text-primary font-medium',
                      )}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none"></div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatarUrl} alt={user?.name} />
                  <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.name}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => logout && logout()}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
