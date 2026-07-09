import { Outlet, Navigate, Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { LogOut, CheckSquare, BarChart, Home, Activity } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export default function Layout() {
  const { user, role, loading, signOut } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Carregando...
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  const navigation = [
    { name: 'Início', href: '/', icon: Home, show: role === 'owner' },
    { name: 'Checklist', href: '/checklist', icon: CheckSquare, show: true },
    { name: 'Relatórios', href: '/reports', icon: BarChart, show: role === 'owner' },
  ].filter((n) => n.show)

  return (
    <div className="min-h-screen bg-background font-sans flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r bg-card fixed inset-y-0 left-0 z-20">
        <div className="flex items-center gap-2 px-6 h-16 border-b">
          <div className="bg-primary p-1.5 rounded-md shadow-sm">
            <Activity className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground tracking-tight">TRoutineG</span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'px-3 py-2.5 rounded-md text-sm font-medium transition-colors flex items-center gap-3',
                location.pathname === item.href
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground',
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          ))}
        </nav>
        <div className="border-t px-3 py-4 space-y-3">
          <div className="px-3 flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-xs font-bold text-primary">{role === 'owner' ? 'P' : 'R'}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {role === 'owner' ? 'Proprietário' : 'Recepcionista'}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => signOut()}
            className="w-full justify-start text-muted-foreground hover:text-destructive"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen w-full">
        {/* Mobile Header */}
        <header className="lg:hidden border-b bg-card sticky top-0 z-10 shadow-sm">
          <div className="px-4">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-2">
                <div className="bg-primary p-1.5 rounded-md shadow-sm">
                  <Activity className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold text-foreground tracking-tight">TRoutineG</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut()}
                className="text-muted-foreground hover:text-destructive"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Mobile nav */}
        <div className="lg:hidden border-b bg-card px-4 py-2 flex overflow-x-auto gap-2 scrollbar-hide">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors',
                location.pathname === item.href
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground',
              )}
            >
              {item.name}
            </Link>
          ))}
        </div>

        <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
