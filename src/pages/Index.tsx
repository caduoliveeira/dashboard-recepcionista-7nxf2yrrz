import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { CheckCircle2, Clock, ChevronRight } from 'lucide-react'
import useChecklistStore from '@/stores/use-checklist-store'
import useAuthStore, { getAvatarUrl } from '@/stores/use-auth-store'
import { Link } from 'react-router-dom'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { DashboardStats } from '@/components/dashboard-stats'
import { StaffPerformance } from '@/components/staff-performance'

export default function Index() {
  const { tasks } = useChecklistStore()
  const { user } = useAuthStore()

  const urgentTasks = tasks
    .filter((t) => t.status !== 'completed')
    .sort((a, b) => a.time.localeCompare(b.time))
    .slice(0, 5)

  const recentlyCompleted = tasks
    .filter((t) => t.status === 'completed' && t.completedAt)
    .sort((a, b) => b.completedAt!.getTime() - a.completedAt!.getTime())
    .slice(0, 4)

  const chartData = [
    { time: '07:00', tasks: 0 },
    { time: '08:00', tasks: 2 },
    { time: '09:00', tasks: 1 },
    { time: '10:00', tasks: 3 },
    { time: '11:00', tasks: 0 },
    { time: '12:00', tasks: 0 },
    { time: '13:00', tasks: 2 },
    { time: '14:00', tasks: 1 },
    { time: '15:00', tasks: 1 },
    { time: '16:00', tasks: 4 },
  ]

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          {user?.role === 'owner' ? 'Painel do Proprietário' : 'Visão Geral'}
        </h1>
        <p className="text-slate-500 mt-1 text-sm">
          {user?.role === 'owner'
            ? 'Monitore o desempenho da equipe e a saúde operacional.'
            : 'Acompanhe a saúde operacional da recepção hoje.'}
        </p>
      </div>

      <DashboardStats tasks={tasks} />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-1 lg:col-span-4 border-none shadow-subtle bg-white">
          <CardHeader>
            <CardTitle>Picos de Atividade</CardTitle>
            <CardDescription>Volume de tarefas concluídas por hora</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{ tasks: { label: 'Concluídas', color: 'hsl(var(--primary))' } }}
              className="h-[300px] w-full"
            >
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="fillTasks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-tasks)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="var(--color-tasks)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis
                  dataKey="time"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  fontSize={12}
                  stroke="#64748B"
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  fontSize={12}
                  stroke="#64748B"
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="tasks"
                  stroke="var(--color-tasks)"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#fillTasks)"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="col-span-1 lg:col-span-3 border-none shadow-subtle bg-white flex flex-col">
          <CardHeader className="pb-4 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <CardTitle>Fila de Prioridades</CardTitle>
              <Link
                to="/checklist"
                className="text-sm font-medium text-primary hover:text-primary/80 flex items-center"
              >
                Ver todas <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            <CardDescription>Próximas tarefas a expirar</CardDescription>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-hidden">
            <div className="divide-y divide-slate-100">
              {urgentTasks.length > 0 ? (
                urgentTasks.map((task) => (
                  <div
                    key={task.id}
                    className={cn(
                      'p-4 flex items-start gap-4 transition-colors hover:bg-slate-50',
                      task.status === 'delayed' && 'bg-rose-50/30 hover:bg-rose-50/60',
                    )}
                  >
                    <div
                      className={cn(
                        'mt-1.5 flex-shrink-0 h-2 w-2 rounded-full',
                        task.status === 'delayed' ? 'bg-rose-500 animate-pulse' : 'bg-amber-400',
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{task.title}</p>
                      <p className="text-xs text-slate-500 truncate mt-1">{task.period}</p>
                    </div>
                    <div
                      className={cn(
                        'text-sm font-medium px-2 py-1 rounded-md h-fit',
                        task.status === 'delayed'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-slate-100 text-slate-700',
                      )}
                    >
                      {task.time}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-500">
                  <CheckCircle2 className="h-8 w-8 mx-auto text-emerald-400 mb-2" />
                  <p>Tudo em dia!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {user?.role === 'owner' && (
        <div className="grid gap-6 md:grid-cols-1">
          <StaffPerformance />
        </div>
      )}

      <Card className="border-none shadow-subtle bg-white">
        <CardHeader>
          <CardTitle>Feed de Atividades Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {recentlyCompleted.map((task, i) => (
              <div key={task.id} className="flex gap-4 relative">
                {i !== recentlyCompleted.length - 1 && (
                  <div className="absolute top-8 left-4 bottom-[-24px] w-px bg-slate-200" />
                )}
                <div className="h-8 w-8 rounded-full bg-primary/10 border-2 border-white flex items-center justify-center flex-shrink-0 z-10 shadow-sm overflow-hidden">
                  {task.completedByAvatarSeed && task.completedByGender ? (
                    <img
                      src={getAvatarUrl({
                        avatarSeed: task.completedByAvatarSeed,
                        gender: task.completedByGender,
                      })}
                      alt={task.completedBy}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  )}
                </div>
                <div className="flex-1 pb-1">
                  <p className="text-sm text-slate-900">
                    <span className="font-semibold">{task.completedBy || task.assignedTo}</span>{' '}
                    concluiu <span className="font-medium text-slate-700">{task.title}</span>
                  </p>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <Clock className="h-3 w-3" />{' '}
                    {task.completedAt ? format(task.completedAt, 'HH:mm', { locale: ptBR }) : ''}
                  </p>
                </div>
              </div>
            ))}
            {recentlyCompleted.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-4">Nenhuma atividade recente.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
