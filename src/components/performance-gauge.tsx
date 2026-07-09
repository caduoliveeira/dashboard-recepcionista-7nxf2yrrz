import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Target, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PerformanceGaugeProps {
  actualRate: number
  targetRate: number
}

export function PerformanceGauge({ actualRate, targetRate }: PerformanceGaugeProps) {
  const isAboveTarget = actualRate >= targetRate
  const isNearTarget = actualRate >= targetRate - 10
  const statusColor = isAboveTarget
    ? 'text-green-600'
    : isNearTarget
      ? 'text-amber-600'
      : 'text-destructive'
  const barColor = isAboveTarget ? 'bg-green-600' : isNearTarget ? 'bg-amber-500' : 'bg-destructive'
  const statusLabel = isAboveTarget
    ? 'Meta Atingida'
    : isNearTarget
      ? 'Próximo da Meta'
      : 'Abaixo da Meta'
  const statusBg = isAboveTarget
    ? 'bg-green-50 text-green-700'
    : isNearTarget
      ? 'bg-amber-50 text-amber-700'
      : 'bg-destructive/5 text-destructive'

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="border-b bg-muted/10 pb-4">
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Meta vs. Desempenho Real
        </CardTitle>
        <CardDescription>
          Comparação entre a taxa de conclusão pontual e a meta definida.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Desempenho Atual</p>
            <p className={cn('text-3xl font-bold tabular-nums', statusColor)}>{actualRate}%</p>
          </div>
          <div className="space-y-1 text-right">
            <p className="text-sm text-muted-foreground">Meta</p>
            <p className="text-3xl font-bold tabular-nums text-foreground">{targetRate}%</p>
          </div>
        </div>

        <div className="relative space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Progresso</span>
            <span>{statusLabel}</span>
          </div>
          <div className="relative h-4 w-full rounded-full bg-muted overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all duration-700', barColor)}
              style={{ width: `${Math.min(actualRate, 100)}%` }}
            />
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-foreground/40"
              style={{ left: `${targetRate}%` }}
            />
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">0%</span>
            <span className="text-foreground font-medium">▲ Meta: {targetRate}%</span>
            <span className="text-muted-foreground">100%</span>
          </div>
        </div>

        <div className={cn('rounded-lg p-3 text-sm font-medium flex items-center gap-2', statusBg)}>
          <TrendingUp className="h-4 w-4" />
          {isAboveTarget
            ? `Excelente! O desempenho atual supera a meta em ${actualRate - targetRate} pontos percentuais.`
            : `Faltam ${targetRate - actualRate} pontos percentuais para atingir a meta.`}
        </div>
      </CardContent>
    </Card>
  )
}
