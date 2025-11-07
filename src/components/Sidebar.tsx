import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Home, Calendar, Users, Shield, Menu, X } from 'lucide-react'
import { useState } from 'react'
import useAuthStore from '@/stores/auth.store'

const navItems = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/scales', label: 'Escalas', icon: Calendar },
  { href: '/military', label: 'Militares', icon: Users },
  {
    href: '/admin/users',
    label: 'Administração',
    icon: Shield,
    adminOnly: true,
  },
]

export const Sidebar = () => {
  const location = useLocation()
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user } = useAuthStore()

  const renderNavLinks = (isMobile = false) => (
    <nav className={cn('flex flex-col gap-2', isMobile ? 'p-4' : 'p-2')}>
      {navItems.map((item) => {
        if (item.adminOnly && user?.role !== 'Admin') {
          return null
        }
        const isActive =
          location.pathname === item.href ||
          (item.href !== '/' && location.pathname.startsWith(item.href))
        return (
          <Link
            key={item.href}
            to={item.href}
            onClick={() => isMobile && setMobileMenuOpen(false)}
          >
            <Button
              variant={isActive ? 'secondary' : 'ghost'}
              className="w-full justify-start"
            >
              <item.icon className="mr-2 h-4 w-4" />
              {item.label}
            </Button>
          </Link>
        )
      })}
    </nav>
  )

  return (
    <>
      <aside className="hidden lg:block fixed left-0 top-16 z-30 h-[calc(100vh-4rem)] w-60 border-r bg-secondary/50">
        <ScrollArea className="h-full py-4">{renderNavLinks()}</ScrollArea>
      </aside>

      <div className="lg:hidden fixed top-3 left-4 z-50">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
        >
          <Menu className="h-6 w-6" />
        </Button>
      </div>

      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/60 animate-fade-in"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="fixed left-0 top-0 h-full w-64 bg-background p-4 animate-slide-in-from-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <span className="font-bold">Menu</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X className="h-6 w-6" />
              </Button>
            </div>
            {renderNavLinks(true)}
          </div>
        </div>
      )}
    </>
  )
}
