import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/components/Sidebar'
import { Header } from '@/components/Header'

export const Layout = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex h-screen overflow-hidden pt-14">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-background p-4 md:ml-64 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
