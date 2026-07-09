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
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="border-none shadow-subtle bg-white">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">Progresso Diário</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-primary" />
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
          <TrendingUp className="h-4 w-4 text-emerald-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-900">92%</div>
          <p className="text-xs text-emerald-600 mt-1 font-medium">+4% comparado a ontem</p>
        </CardContent>
      </Card>
    </div>
  )
}
