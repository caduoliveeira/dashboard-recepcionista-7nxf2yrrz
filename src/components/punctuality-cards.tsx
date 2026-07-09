import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { CheckCircle2, Clock, AlertTriangle, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PunctualityCardsProps {
  progress: number
  onTimeRate: number
  delayedCount: number
  pendingCount: number
  totalCompleted: number
  totalTasks: number
}

export function PunctualityCards({
  progress,
  onTimeRate,
  delayedCount,
  pendingCount,
  totalCompleted,
  totalTasks,
}: PunctualityCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="border-border/60 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5">
          <CheckCircle2 className="w-24 h-24" />
        </div>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Progresso do Dia
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-bold tracking-tighter">{progress}%</span>
            <span className="text-sm font-medium text-muted-foreground">Concluído</span>
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground mt-3 font-medium">
            {totalCompleted} de {totalTasks} tarefas finalizadas
          </p>
        </CardContent>
      </Card>

      <Card className="border-border/60 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5">
          <TrendingUp className="w-24 h-24" />
        </div>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Taxa de Pontualidade
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2 mb-2">
            <span
              className={cn(
                'text-3xl font-bold tracking-tighter',
                onTimeRate >= 80
                  ? 'text-green-600'
                  : onTimeRate >= 50
                    ? 'text-amber-600'
                    : 'text-destructive',
              )}
            >
              {onTimeRate}%
            </span>
            <span className="text-sm font-medium text-muted-foreground">No Prazo</span>
          </div>
          <Progress value={onTimeRate} className="h-2" />
          <p className="text-xs text-muted-foreground mt-3 font-medium">
            Concluídas antes do horário previsto
          </p>
        </CardContent>
      </Card>

      <Card
        className={cn(
          'border-border/60 shadow-sm relative overflow-hidden',
          delayedCount > 0 && 'bg-destructive/5',
        )}
      >
        <div className="absolute top-0 right-0 p-4 opacity-5 text-destructive">
          <AlertTriangle className="w-24 h-24" />
        </div>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Tarefas Atrasadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <span
              className={cn(
                'text-3xl font-bold tracking-tighter',
                delayedCount > 0 ? 'text-destructive' : 'text-green-600',
              )}
            >
              {delayedCount}
            </span>
            <span className="text-sm font-medium text-muted-foreground">Pendentes</span>
          </div>
          <p className="text-xs text-muted-foreground mt-4 font-medium">
            {delayedCount === 0 ? 'Rotina dentro do horário.' : 'Atenção aos horários limite.'}
          </p>
        </CardContent>
      </Card>

      <Card className="border-border/60 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5">
          <Clock className="w-24 h-24" />
        </div>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Aguardando</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tighter">{pendingCount}</span>
            <span className="text-sm font-medium text-muted-foreground">Pendentes</span>
          </div>
          <p className="text-xs text-muted-foreground mt-4 font-medium">
            Tarefas ainda não iniciadas hoje
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
