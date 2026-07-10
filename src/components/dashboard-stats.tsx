import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, Activity, AlertCircle, TrendingUp } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import type { Task } from '@/stores/use-checklist-store'

export function DashboardStats({ tasks }: { tasks: Task[] }) {
  const completedCount = tasks.filter((t) => t.status === 'completed').length
  const delayedCount = tasks.filter((t) => t.status === 'delayed').length
  const activeCount = tasks.filter((t) => t.status === 'pending').length
  const progress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card className="border border-slate-100 shadow-elevation bg-white rounded-2xl relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/80 to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
        <CardHeader className="flex flex-row items-center justify-between pb-3 pt-6">
          <CardTitle className="text-xs font-bold tracking-widest text-slate-500 uppercase">
            Progresso Diário
          </CardTitle>
          <div className="bg-primary/10 p-2 rounded-lg">
            <CheckCircle2 className="h-5 w-5 text-primary" strokeWidth={2.5} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-extrabold text-slate-900 tracking-tight">{progress}%</div>
          <Progress value={progress} className="h-2 mt-4 bg-slate-100 [&>div]:bg-primary" />
          <p className="text-[11px] font-semibold tracking-wider text-slate-400 mt-3 uppercase">
            {completedCount} de {tasks.length} concluídas
          </p>
        </CardContent>
      </Card>

      <Card className="border border-slate-100 shadow-elevation bg-white rounded-2xl relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500/80 to-amber-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
        <CardHeader className="flex flex-row items-center justify-between pb-3 pt-6">
          <CardTitle className="text-xs font-bold tracking-widest text-slate-500 uppercase">
            Tarefas Ativas
          </CardTitle>
          <div className="bg-amber-50 p-2 rounded-lg">
            <Activity className="h-5 w-5 text-amber-500" strokeWidth={2.5} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-extrabold text-slate-900 tracking-tight">{activeCount}</div>
          <p className="text-[11px] font-semibold tracking-wider text-slate-400 mt-3 uppercase">
            Aguardando execução
          </p>
        </CardContent>
      </Card>

      <Card
        className={cn(
          'border border-slate-100 shadow-elevation rounded-2xl relative overflow-hidden group transition-all duration-500',
          delayedCount > 0 ? 'bg-rose-50/30 border-rose-100' : 'bg-white',
        )}
      >
        <div
          className={cn(
            'absolute top-0 left-0 w-full h-1 transition-opacity',
            delayedCount > 0
              ? 'bg-gradient-to-r from-rose-500 to-rose-300 opacity-100'
              : 'bg-gradient-to-r from-slate-400 to-slate-200 opacity-0 group-hover:opacity-100',
          )}
        />
        <CardHeader className="flex flex-row items-center justify-between pb-3 pt-6">
          <CardTitle className="text-xs font-bold tracking-widest text-slate-500 uppercase">
            Atenção Necessária
          </CardTitle>
          <div className={cn('p-2 rounded-lg', delayedCount > 0 ? 'bg-rose-100' : 'bg-slate-100')}>
            <AlertCircle
              className={cn('h-5 w-5', delayedCount > 0 ? 'text-rose-600' : 'text-slate-400')}
              strokeWidth={2.5}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div
            className={cn(
              'text-4xl font-extrabold tracking-tight',
              delayedCount > 0 ? 'text-rose-600' : 'text-slate-900',
            )}
          >
            {delayedCount}
          </div>
          <p
            className={cn(
              'text-[11px] font-semibold tracking-wider mt-3 uppercase',
              delayedCount > 0 ? 'text-rose-500' : 'text-slate-400',
            )}
          >
            Tarefas atrasadas
          </p>
        </CardContent>
      </Card>

      <Card className="border border-slate-100 shadow-elevation bg-white rounded-2xl relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500/80 to-emerald-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
        <CardHeader className="flex flex-row items-center justify-between pb-3 pt-6">
          <CardTitle className="text-xs font-bold tracking-widest text-slate-500 uppercase">
            Eficiência
          </CardTitle>
          <div className="bg-emerald-50 p-2 rounded-lg">
            <TrendingUp className="h-5 w-5 text-emerald-500" strokeWidth={2.5} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-extrabold text-slate-900 tracking-tight">92%</div>
          <p className="text-[11px] font-bold tracking-wider text-emerald-600 mt-3 uppercase bg-emerald-50 inline-block px-2 py-0.5 rounded">
            +4% comparado a ontem
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
