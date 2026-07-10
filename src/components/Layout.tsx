import { useState, useEffect } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import {
  LogOut,
  CheckSquare,
  BarChart,
  Home,
  Package,
  Wrench,
  ShoppingCart,
  LifeBuoy,
  Clock,
  Users,
  MessageSquare,
  ClipboardCheck,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { NotificationBell } from '@/components/notification-bell'
import { ErrorBoundary } from '@/components/error-boundary'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import logoImg from '@/assets/06-b2e9d.png'

export default function Layout() {
  const { role, signOut } = useAuth()
  const location = useLocation()
  const [isCollapsed, setIsCollapsed] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      // Auto collapse sidebar on smaller screens (tablets)
      if (window.innerWidth >= 1024 && window.innerWidth < 1280) {
        setIsCollapsed(true)
      } else if (window.innerWidth >= 1280) {
        setIsCollapsed(false)
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home, show: role === 'owner' },
    { name: 'Checklist', href: '/checklist', icon: CheckSquare, show: true },
    { name: 'Estoque', href: '/inventory', icon: Package, show: true },
    { name: 'Manutenção', href: '/maintenance', icon: Wrench, show: true },
    { name: 'Mercado', href: '/shopping', icon: ShoppingCart, show: true },
    { name: 'Emergência', href: '/emergency', icon: LifeBuoy, show: true },
    { name: 'Turnos', href: '/shifts', icon: Clock, show: role === 'owner' },
    { name: 'Gerenciamento de Equipe', href: '/admin/users', icon: Users, show: role === 'owner' },
    { name: 'Relatórios', href: '/reports', icon: BarChart, show: role === 'owner' },
    { name: 'Auditoria', href: '/admin/audit', icon: ClipboardCheck, show: role === 'owner' },
    { name: 'Chat', href: '/chat', icon: MessageSquare, show: true },
  ].filter((n) => n.show)

  return (
    <div className="min-h-screen bg-background font-sans flex text-foreground selection:bg-primary/20 selection:text-foreground">
      {/* Desktop Sidebar - Premium Brand Theme */}
      <aside
        className={cn(
          'hidden lg:flex flex-col border-r border-border bg-card text-foreground fixed inset-y-0 left-0 z-40 shadow-md transition-all duration-300 ease-in-out',
          isCollapsed ? 'w-20' : 'w-64',
        )}
      >
        <div className="flex items-center justify-center h-24 border-b border-border px-4 shrink-0 relative overflow-hidden bg-foreground transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/20 to-transparent pointer-events-none opacity-50" />
          <img
            src={logoImg}
            alt="TRG Logo"
            className={cn(
              'h-16 w-auto object-contain relative z-10 drop-shadow-md transition-all duration-300',
              isCollapsed && 'scale-75 h-10',
            )}
          />
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-10 z-50 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm hover:text-foreground hover:bg-muted focus:outline-none focus:ring-1 focus:ring-primary"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>

        <div
          className={cn('py-4 flex-1 overflow-hidden flex flex-col', isCollapsed ? 'px-3' : 'px-6')}
        >
          {!isCollapsed && (
            <p className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase mb-4 ml-2 shrink-0">
              Menu Principal
            </p>
          )}
          <nav className="space-y-1.5 overflow-y-auto flex-1 scrollbar-hide pb-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  title={isCollapsed ? item.name : undefined}
                  className={cn(
                    'py-3 rounded-xl text-sm font-medium transition-all duration-300 flex items-center group relative overflow-hidden',
                    isCollapsed ? 'justify-center px-0' : 'px-4 gap-3',
                    isActive
                      ? 'text-foreground bg-primary/5 border border-primary/20 shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
                  )}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-primary rounded-r-full shadow-sm" />
                  )}
                  <item.icon
                    className={cn(
                      'h-5 w-5 relative z-10 transition-colors',
                      isActive
                        ? 'text-primary'
                        : 'text-muted-foreground/70 group-hover:text-primary/80',
                    )}
                  />
                  {!isCollapsed && (
                    <span className="relative z-10 tracking-wide font-semibold whitespace-nowrap">
                      {item.name}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>
        </div>

        <div
          className={cn(
            'mt-auto border-t border-border bg-muted/10 backdrop-blur-md transition-all duration-300',
            isCollapsed ? 'p-3 flex flex-col items-center gap-4' : 'p-5',
          )}
        >
          <div
            className={cn('flex items-center', isCollapsed ? 'justify-center' : 'gap-3 mb-4 px-2')}
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-primary-hover border border-primary/20 flex items-center justify-center shadow-sm shrink-0">
              <span className="text-sm font-bold text-primary-foreground shadow-sm">
                {role === 'owner' ? 'P' : 'R'}
              </span>
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground tracking-wide truncate">
                  {role === 'owner' ? 'Proprietário' : 'Recepcionista'}
                </p>
                <p className="text-xs text-muted-foreground truncate tracking-wider font-medium">
                  Acesso Master
                </p>
              </div>
            )}
            {!isCollapsed && role === 'owner' && <NotificationBell />}
          </div>
          {isCollapsed && role === 'owner' && <NotificationBell />}
          <Button
            variant="ghost"
            onClick={() => signOut()}
            title={isCollapsed ? 'Encerrar Sessão' : undefined}
            className={cn(
              'text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl h-11 transition-all w-full',
              isCollapsed ? 'justify-center px-0' : 'justify-start',
            )}
          >
            <LogOut className={cn('h-5 w-5', !isCollapsed && 'mr-3')} />
            {!isCollapsed && (
              <span className="tracking-wide font-semibold whitespace-nowrap">Encerrar Sessão</span>
            )}
          </Button>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div
        className={cn(
          'flex flex-col min-h-screen w-full relative bg-background transition-all duration-300 ease-in-out flex-1',
          isCollapsed ? 'lg:pl-20' : 'lg:pl-64',
        )}
      >
        {/* Subtle background texture for the main content */}
        <div className="absolute inset-0 bg-[url('https://img.usecurling.com/p/100/100?q=noise')] opacity-[0.02] pointer-events-none mix-blend-multiply" />

        {/* Mobile Header */}
        <header className="lg:hidden border-b border-border bg-card/90 backdrop-blur-xl sticky top-0 z-20 shadow-sm">
          <div className="px-4">
            <div className="flex justify-between items-center h-16">
              <div className="h-10 bg-foreground px-3 py-1 rounded-lg flex items-center justify-center border border-border">
                <img src={logoImg} alt="TRG Logo" className="h-8 w-auto drop-shadow-sm" />
              </div>
              <div className="flex items-center gap-2">
                {role === 'owner' && <NotificationBell />}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => signOut()}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile nav */}
        <div className="lg:hidden border-b border-border bg-muted/30 backdrop-blur-md px-4 py-3 flex overflow-x-auto gap-2 scrollbar-hide z-10 sticky top-16 shadow-sm">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all border',
                  isActive
                    ? 'bg-primary border-primary text-primary-foreground shadow-sm'
                    : 'bg-card text-muted-foreground border-border hover:border-primary/30 hover:text-foreground',
                )}
              >
                {item.name}
              </Link>
            )
          })}
        </div>

        <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-8 lg:py-10 relative z-0">
          <div className="max-w-[1600px] mx-auto w-full">
            <ErrorBoundary compact>
              <Outlet />
            </ErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  )
}
