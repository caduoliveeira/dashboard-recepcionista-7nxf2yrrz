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
      <Card className="border border-white/10 shadow-glass bg-card/60 backdrop-blur-xl rounded-2xl relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-primary/50 opacity-50 group-hover:opacity-100 transition-opacity" />
        <CardHeader className="flex flex-row items-center justify-between pb-3 pt-6">
          <CardTitle className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
            Progresso Diário
          </CardTitle>
          <div className="bg-primary/10 p-2 rounded-lg border border-primary/20 shadow-glow-sm">
            <CheckCircle2 className="h-5 w-5 text-primary drop-shadow-glow" strokeWidth={2.5} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-extrabold text-foreground tracking-tight">{progress}%</div>
          <Progress
            value={progress}
            className="h-2 mt-4 bg-white/5 [&>div]:bg-gradient-to-r [&>div]:from-primary [&>div]:to-primary/80"
          />
          <p className="text-[11px] font-semibold tracking-wider text-muted-foreground mt-3 uppercase">
            {completedCount} de {tasks.length} concluídas
          </p>
        </CardContent>
      </Card>

      <Card className="border border-white/10 shadow-glass bg-card/60 backdrop-blur-xl rounded-2xl relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-amber-500/50 opacity-50 group-hover:opacity-100 transition-opacity" />
        <CardHeader className="flex flex-row items-center justify-between pb-3 pt-6">
          <CardTitle className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
            Tarefas Ativas
          </CardTitle>
          <div className="bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
            <Activity
              className="h-5 w-5 text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]"
              strokeWidth={2.5}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-extrabold text-foreground tracking-tight">
            {activeCount}
          </div>
          <p className="text-[11px] font-semibold tracking-wider text-muted-foreground mt-3 uppercase">
            Aguardando execução
          </p>
        </CardContent>
      </Card>

      <Card
        className={cn(
          'border border-white/10 shadow-glass rounded-2xl relative overflow-hidden group transition-all duration-500',
          delayedCount > 0
            ? 'bg-destructive/10 border-destructive/20 backdrop-blur-xl'
            : 'bg-card/60 backdrop-blur-xl',
        )}
      >
        <div
          className={cn(
            'absolute top-0 left-0 w-full h-1 transition-opacity',
            delayedCount > 0
              ? 'bg-gradient-to-r from-destructive to-destructive/50 opacity-100 shadow-glow'
              : 'bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-50',
          )}
        />
        <CardHeader className="flex flex-row items-center justify-between pb-3 pt-6">
          <CardTitle className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
            Atenção Necessária
          </CardTitle>
          <div
            className={cn(
              'p-2 rounded-lg border',
              delayedCount > 0
                ? 'bg-destructive/20 border-destructive/30'
                : 'bg-white/5 border-white/10',
            )}
          >
            <AlertCircle
              className={cn(
                'h-5 w-5',
                delayedCount > 0
                  ? 'text-destructive drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]'
                  : 'text-muted-foreground',
              )}
              strokeWidth={2.5}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div
            className={cn(
              'text-4xl font-extrabold tracking-tight',
              delayedCount > 0 ? 'text-destructive' : 'text-foreground',
            )}
          >
            {delayedCount}
          </div>
          <p
            className={cn(
              'text-[11px] font-semibold tracking-wider mt-3 uppercase',
              delayedCount > 0 ? 'text-destructive/80' : 'text-muted-foreground',
            )}
          >
            Tarefas atrasadas
          </p>
        </CardContent>
      </Card>

      <Card className="border border-white/10 shadow-glass bg-card/60 backdrop-blur-xl rounded-2xl relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-emerald-500/50 opacity-50 group-hover:opacity-100 transition-opacity" />
        <CardHeader className="flex flex-row items-center justify-between pb-3 pt-6">
          <CardTitle className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
            Eficiência
          </CardTitle>
          <div className="bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
            <TrendingUp
              className="h-5 w-5 text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]"
              strokeWidth={2.5}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-extrabold text-foreground tracking-tight">92%</div>
          <p className="text-[11px] font-bold tracking-wider text-emerald-400 mt-3 uppercase bg-emerald-500/10 inline-block px-2 py-0.5 rounded border border-emerald-500/20">
            +4% comparado a ontem
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
