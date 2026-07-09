import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { AlertTriangle, CheckCircle2 } from 'lucide-react'
import { Progress } from '@/components/ui/progress'

interface DelayedTaskStat {
  title: string
  category: string
  lateCount: number
  totalCount: number
}

const CATEGORY_LABELS: Record<string, string> = {
  Opening: 'Abertura',
  Shift: 'Turno',
  Closing: 'Fechamento',
}

export function DelayedTasksList({ stats }: { stats: DelayedTaskStat[] }) {
  return (
    <Card className="shadow-sm border-border/60">
      <CardHeader className="border-b bg-muted/10 pb-4">
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          Tarefas Frequentemente Atrasadas
        </CardTitle>
        <CardDescription>
          Tarefas com maior incidência de atraso nos últimos 7 dias.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {stats.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-green-500" />
            <p className="font-medium">Nenhum atraso registrado!</p>
            <p className="text-sm mt-1">A equipe está mantendo a pontualidade.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {stats.map((s, i) => {
              const lateRate = s.totalCount > 0 ? Math.round((s.lateCount / s.totalCount) * 100) : 0
              return (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-sm font-medium text-foreground">{s.title}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        {CATEGORY_LABELS[s.category] || s.category}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-destructive">{s.lateCount}x</span>
                  </div>
                  <Progress value={lateRate} className="h-1.5" />
                  <p className="text-xs text-muted-foreground">
                    {s.lateCount} de {s.totalCount} conclusões com atraso ({lateRate}%)
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
