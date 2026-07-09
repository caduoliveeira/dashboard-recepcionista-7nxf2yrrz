import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { fetchTasks, fetchRecentCompletions } from '@/services/tasks'
import { CalendarDays } from 'lucide-react'

export function YesterdayPerformance() {
  const [data, setData] = useState<{ completed: number; total: number; rate: number } | null>(null)

  useEffect(() => {
    const load = async () => {
      const [tasksRes, completionsRes] = await Promise.all([
        fetchTasks(),
        fetchRecentCompletions(2),
      ])
      const tasks = tasksRes.data || []
      const completions = completionsRes.data || []

      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      yesterday.setHours(0, 0, 0, 0)
      const todayStart = new Date()
      todayStart.setHours(0, 0, 0, 0)

      const yesterdayCompletions = completions.filter((c) => {
        const d = new Date(c.completed_at)
        return d >= yesterday && d < todayStart
      })

      const completedCount = yesterdayCompletions.length
      const totalCount = tasks.length
      const rate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

      setData({ completed: completedCount, total: totalCount, rate })
    }
    load()
  }, [])

  if (!data) return null

  return (
    <Card className="shadow-sm border-border/60">
      <CardHeader className="border-b bg-muted/10 pb-4">
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-primary" />
          Performance de Ontem
        </CardTitle>
        <CardDescription>Resumo da execucao de tarefas do dia anterior.</CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-3xl font-bold text-foreground">{data.rate}%</span>
            <span className="text-sm text-muted-foreground ml-2">de conclusao</span>
          </div>
          <span className="text-sm text-muted-foreground">
            {data.completed} de {data.total} tarefas
          </span>
        </div>
        <Progress value={data.rate} className="h-3" />
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="rounded-lg bg-muted/40 p-3">
            <p className="text-xs text-muted-foreground">Concluidas</p>
            <p className="text-xl font-bold text-primary">{data.completed}</p>
          </div>
          <div className="rounded-lg bg-muted/40 p-3">
            <p className="text-xs text-muted-foreground">Total Agendado</p>
            <p className="text-xl font-bold text-foreground">{data.total}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
