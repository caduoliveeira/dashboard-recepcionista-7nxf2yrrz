import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { CheckCircle2, Clock, AlertCircle, Activity, ChevronRight } from 'lucide-react'
import useChecklistStore from '@/stores/use-checklist-store'
import { Link } from 'react-router-dom'
import { Progress } from '@/components/ui/progress'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function Index() {
  const { tasks } = useChecklistStore()

  const completedCount = tasks.filter((t) => t.status === 'completed').length
  const delayedCount = tasks.filter((t) => t.status === 'delayed').length
  const activeCount = tasks.filter((t) => t.status === 'pending').length
  const progress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0

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
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Visão Geral</h1>
        <p className="text-slate-500 mt-1 text-sm">
          Acompanhe a saúde operacional da recepção hoje.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none shadow-subtle bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Progresso Diário</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{progress}%</div>
            <Progress value={progress} className="h-2 mt-3 bg-slate-100" />
            <p className="text-xs text-slate-500 mt-2">
              {completedCount} de {tasks.length} concluídas
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-subtle bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Tarefas Ativas</CardTitle>
            <Activity className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{activeCount}</div>
            <p className="text-xs text-slate-500 mt-1">Aguardando execução</p>
          </CardContent>
        </Card>

        <Card
          className={cn(
            'border-none shadow-subtle bg-white transition-colors',
            delayedCount > 0 && 'bg-rose-50/50',
          )}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Atenção Necessária</CardTitle>
            <AlertCircle
              className={cn('h-4 w-4', delayedCount > 0 ? 'text-rose-600' : 'text-slate-400')}
            />
          </CardHeader>
          <CardContent>
            <div
              className={cn(
                'text-2xl font-bold',
                delayedCount > 0 ? 'text-rose-600' : 'text-slate-900',
              )}
            >
              {delayedCount}
            </div>
            <p className="text-xs text-slate-500 mt-1">Tarefas atrasadas</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-subtle bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Eficiência</CardTitle>
            <Activity className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">92%</div>
            <p className="text-xs text-emerald-600 mt-1 font-medium">+4% comparado a ontem</p>
          </CardContent>
        </Card>
      </div>

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
                className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center"
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

      <div className="grid gap-6 md:grid-cols-1">
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
                  <div className="h-8 w-8 rounded-full bg-indigo-50 border-2 border-white flex items-center justify-center flex-shrink-0 z-10 shadow-sm">
                    <CheckCircle2 className="h-4 w-4 text-indigo-600" />
                  </div>
                  <div className="flex-1 pb-1">
                    <p className="text-sm text-slate-900">
                      <span className="font-semibold">{task.assignedTo}</span> concluiu{' '}
                      <span className="font-medium text-indigo-900">{task.title}</span>
                    </p>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <Clock className="h-3 w-3" />{' '}
                      {task.completedAt ? format(task.completedAt, 'HH:mm', { locale: ptBR }) : ''}
                    </p>
                  </div>
                </div>
              ))}
              {recentlyCompleted.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-4">
                  Nenhuma atividade recente.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
