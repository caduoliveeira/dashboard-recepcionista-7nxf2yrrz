import { Outlet, Link, useLocation } from 'react-router-dom'
import {
  Sidebar,
  SidebarProvider,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar'
import { Home, CheckSquare, BarChart2, Bell, AlertTriangle, Building } from 'lucide-react'
import useDateStore from '@/stores/use-date-store'
import useChecklistStore from '@/stores/use-checklist-store'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Button } from '@/components/ui/button'

export default function Layout() {
  const location = useLocation()
  const { now } = useDateStore()
  const { tasks } = useChecklistStore()

  const delayedTasks = tasks.filter((t) => t.status === 'delayed').length

  const navItems = [
    { title: 'Painel de Controle', url: '/', icon: Home },
    { title: 'Rotina Diária', url: '/checklist', icon: CheckSquare },
    { title: 'Relatórios', url: '/reports', icon: BarChart2 },
  ]

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
        <Sidebar className="border-r border-slate-200 bg-white">
          <SidebarHeader className="h-16 flex items-center px-4 border-b border-slate-100">
            <div className="flex items-center gap-3 font-semibold text-slate-800">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm">
                <Building className="h-4 w-4" />
              </div>
              <span className="tracking-tight">Recepção Exímia</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent className="pt-4">
                <SidebarMenu>
                  {navItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={location.pathname === item.url}
                        tooltip={item.title}
                      >
                        <Link to={item.url} className="gap-3 py-5">
                          <item.icon className="h-5 w-5" />
                          <span className="font-medium text-[15px]">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <SidebarInset className="flex-1 flex flex-col bg-slate-50 overflow-hidden">
          <header className="h-16 flex items-center justify-between px-6 border-b border-slate-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)] shrink-0">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="text-slate-500 hover:text-slate-900" />
              <div className="hidden md:flex flex-col">
                <span className="text-xl font-bold tracking-tight text-slate-900 leading-none">
                  {format(now, 'HH:mm:ss')}
                </span>
                <span className="text-xs font-medium text-slate-500 capitalize mt-1">
                  {format(now, "EEEE, d 'de' MMMM", { locale: ptBR })}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-5">
              {delayedTasks > 0 && (
                <div className="hidden md:flex items-center gap-2 bg-rose-50 text-rose-700 px-3 py-1.5 rounded-full border border-rose-100 animate-pulse-red shadow-sm">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm font-semibold">{delayedTasks} Atrasado(s)</span>
                </div>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="relative text-slate-500 hover:text-slate-900"
              >
                <Bell className="h-5 w-5" />
                {delayedTasks > 0 && (
                  <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-rose-600 border-2 border-white" />
                )}
              </Button>
              <div className="h-9 w-9 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden flex-shrink-0">
                <img
                  src="https://img.usecurling.com/ppl/thumbnail?gender=female&seed=1"
                  alt="Avatar"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-auto p-4 md:p-8 animate-fade-in-up">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
