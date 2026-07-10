import { Outlet, Navigate, Link, useLocation } from 'react-router-dom'
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
} from 'lucide-react'
import { NotificationBell } from '@/components/notification-bell'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import logoImg from '@/assets/02-04684.png'

export default function Layout() {
  const { user, role, loading, signOut } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-glow"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home, show: role === 'owner' },
    { name: 'Checklist', href: '/checklist', icon: CheckSquare, show: true },
    { name: 'Estoque', href: '/inventory', icon: Package, show: true },
    { name: 'Manutenção', href: '/maintenance', icon: Wrench, show: true },
    { name: 'Mercado', href: '/shopping', icon: ShoppingCart, show: true },
    { name: 'Emergência', href: '/emergency', icon: LifeBuoy, show: true },
    { name: 'Turnos', href: '/shifts', icon: Clock, show: role === 'owner' },
    { name: 'Usuários', href: '/admin/users', icon: Users, show: role === 'owner' },
    { name: 'Relatórios', href: '/reports', icon: BarChart, show: role === 'owner' },
    { name: 'Auditoria', href: '/admin/audit', icon: ClipboardCheck, show: role === 'owner' },
    { name: 'Chat', href: '/chat', icon: MessageSquare, show: true },
  ].filter((n) => n.show)

  return (
    <div className="min-h-screen bg-background font-sans flex text-foreground selection:bg-primary/30 selection:text-primary-foreground">
      {/* Desktop Sidebar - Premium Dark Mode */}
      <aside className="hidden lg:flex flex-col w-72 border-r border-white/5 bg-card/50 backdrop-blur-xl text-white fixed inset-y-0 left-0 z-30 shadow-glass">
        <div className="flex items-center justify-center h-28 border-b border-white/5 px-6 shrink-0 relative overflow-hidden bg-black/20">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/20 to-transparent opacity-30 pointer-events-none" />
          <img
            src={logoImg}
            alt="TRG Logo"
            className="h-12 w-auto object-contain relative z-10 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]"
          />
        </div>

        <div className="px-6 py-4">
          <p className="text-[10px] font-semibold tracking-[0.2em] text-white/40 uppercase mb-4 ml-2">
            Menu Principal
          </p>
          <nav className="space-y-1.5 overflow-y-auto max-h-[calc(100vh-280px)] scrollbar-hide pb-10">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-3 group relative overflow-hidden',
                    isActive
                      ? 'text-white bg-white/5 border border-white/10 shadow-[inset_0_0_20px_rgba(128,0,32,0.2)]'
                      : 'text-white/50 hover:text-white hover:bg-white/5',
                  )}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full shadow-glow" />
                  )}
                  <item.icon
                    className={cn(
                      'h-4 w-4 relative z-10 transition-colors',
                      isActive
                        ? 'text-primary drop-shadow-glow'
                        : 'text-white/40 group-hover:text-primary',
                    )}
                  />
                  <span className="relative z-10 tracking-wide">{item.name}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="mt-auto border-t border-white/5 p-5 bg-black/40 backdrop-blur-md">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-primary/60 border border-primary/50 flex items-center justify-center shadow-glow-sm">
              <span className="text-sm font-bold text-white shadow-sm">
                {role === 'owner' ? 'P' : 'R'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white tracking-wide truncate">
                {role === 'owner' ? 'Proprietário' : 'Recepcionista'}
              </p>
              <p className="text-xs text-white/40 truncate tracking-wider">Acesso Master</p>
            </div>
            {role === 'owner' && <NotificationBell />}
          </div>
          <Button
            variant="ghost"
            onClick={() => signOut()}
            className="w-full justify-start text-white/50 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl h-11 transition-all"
          >
            <LogOut className="h-4 w-4 mr-3" />
            <span className="tracking-wide">Encerrar Sessão</span>
          </Button>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 lg:ml-72 flex flex-col min-h-screen w-full relative bg-background">
        {/* Subtle background texture for the main content */}
        <div className="absolute inset-0 bg-[url('https://img.usecurling.com/p/100/100?q=noise')] opacity-[0.03] pointer-events-none mix-blend-overlay" />

        {/* Mobile Header */}
        <header className="lg:hidden border-b border-white/5 bg-background/80 backdrop-blur-xl sticky top-0 z-20 shadow-glass">
          <div className="px-4">
            <div className="flex justify-between items-center h-16">
              <img
                src={logoImg}
                alt="TRG Logo"
                className="h-8 w-auto drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]"
              />
              <div className="flex items-center gap-2">
                {role === 'owner' && <NotificationBell />}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => signOut()}
                  className="text-white/60 hover:text-rose-500"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile nav */}
        <div className="lg:hidden border-b border-white/5 bg-black/40 backdrop-blur-md px-4 py-3 flex overflow-x-auto gap-2 scrollbar-hide z-10 sticky top-16 shadow-subtle">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all border',
                  isActive
                    ? 'bg-gradient-to-r from-primary to-primary/80 border-primary/50 text-white shadow-glow'
                    : 'bg-white/5 text-white/60 border-white/10 hover:border-primary/50 hover:bg-white/10 hover:text-white',
                )}
              >
                {item.name}
              </Link>
            )
          })}
        </div>

        <main className="flex-1 w-full px-4 sm:px-6 lg:px-12 py-8 lg:py-10 relative z-0">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
