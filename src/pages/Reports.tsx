import { useState, useEffect, useMemo } from 'react'
import { Navigate } from 'react-router-dom'
import {
  fetchTasks,
  fetchTodayCompletions,
  fetchRecentCompletions,
  type Task,
  type TaskCompletion,
  type CompletionWithTask,
} from '@/services/tasks'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { PunctualityCards } from '@/components/punctuality-cards'
import { DelayedTasksList } from '@/components/delayed-tasks-list'
import { wasCompletedLate, isTaskOverdue } from '@/lib/task-utils'
import { exportToCSV } from '@/lib/csv-utils'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

const CATEGORY_LABELS: Record<string, string> = {
  Opening: 'Abertura',
  Shift: 'Turno',
  Closing: 'Fechamento',
}

export default function Reports() {
  const { role } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [completions, setCompletions] = useState<TaskCompletion[]>([])
  const [recentCompletions, setRecentCompletions] = useState<CompletionWithTask[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    const [t, c, r] = await Promise.all([
      fetchTasks(),
      fetchTodayCompletions(),
      fetchRecentCompletions(7),
    ])
    if (t.data) setTasks(t.data)
    if (c.data) setCompletions(c.data)
    if (r.data) setRecentCompletions(r.data)
    setLoading(false)
  }

  const stats = useMemo(() => {
    const completedIds = new Set(completions.map((c) => c.task_id))
    const completedCount = completions.length
    const totalTasks = tasks.length
    const progress = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0
    const onTimeCount = completions.filter((c) => {
      const task = tasks.find((t) => t.id === c.task_id)
      return task && !wasCompletedLate(c.completed_at, task.expected_time)
    }).length
    const onTimeRate = completedCount > 0 ? Math.round((onTimeCount / completedCount) * 100) : 100
    const delayedCount = tasks.filter(
      (t) => !completedIds.has(t.id) && isTaskOverdue(t.expected_time, false),
    ).length
    const pendingCount = totalTasks - completedCount

    const delayedMap = new Map<
      string,
      { title: string; category: string; lateCount: number; totalCount: number }
    >()
    recentCompletions.forEach((c) => {
      if (!c.tasks) return
      const ex = delayedMap.get(c.task_id) || {
        title: c.tasks.title,
        category: c.tasks.category,
        lateCount: 0,
        totalCount: 0,
      }
      ex.totalCount++
      if (wasCompletedLate(c.completed_at, c.tasks.expected_time)) ex.lateCount++
      delayedMap.set(c.task_id, ex)
    })
    const frequentlyDelayed = Array.from(delayedMap.values())
      .filter((s) => s.lateCount > 0)
      .sort((a, b) => b.lateCount - a.lateCount)
      .slice(0, 5)

    return {
      progress,
      onTimeRate,
      delayedCount,
      pendingCount,
      completedCount,
      totalTasks,
      frequentlyDelayed,
    }
  }, [tasks, completions, recentCompletions])

  const handleExport = () => {
    const headers = [
      'Tarefa',
      'Categoria',
      'Horario Previsto',
      'Horario de Conclusao',
      'Status',
      'Responsavel',
    ]
    const rows = tasks.map((task) => {
      const completion = completions.find((c) => c.task_id === task.id)
      const isCompleted = !!completion
      const late = isCompleted && wasCompletedLate(completion!.completed_at, task.expected_time)
      const status = isCompleted
        ? late
          ? 'Atrasado'
          : 'No Prazo'
        : isTaskOverdue(task.expected_time, false)
          ? 'Atrasado'
          : 'Pendente'
      const completionTime = isCompleted
        ? new Date(completion.completed_at).toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
          })
        : ''
      return [
        task.title,
        CATEGORY_LABELS[task.category] || task.category,
        task.expected_time ? task.expected_time.slice(0, 5) : '',
        completionTime,
        status,
        isCompleted ? completion.profiles?.full_name || 'Usuario' : '',
      ]
    })
    exportToCSV(`relatorio-trg-${new Date().toISOString().slice(0, 10)}.csv`, headers, rows)
  }

  if (role !== 'owner') return <Navigate to="/checklist" replace />
  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-[400px]" />
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Relatório de Performance
          </h1>
          <p className="text-muted-foreground mt-1">
            Acompanhamento da execução e pontualidade da rotina.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full border">
            <Clock className="h-4 w-4" />
            {new Date().toLocaleDateString('pt-BR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </div>
          <Button variant="outline" onClick={handleExport} className="gap-2">
            <Download className="h-4 w-4" /> Exportar CSV
          </Button>
        </div>
      </div>

      <PunctualityCards
        progress={stats.progress}
        onTimeRate={stats.onTimeRate}
        delayedCount={stats.delayedCount}
        pendingCount={stats.pendingCount}
        totalCompleted={stats.completedCount}
        totalTasks={stats.totalTasks}
      />

      <Card className="shadow-sm border-border/60">
        <CardHeader className="border-b bg-muted/10 pb-4">
          <CardTitle>Detalhamento das Tarefas</CardTitle>
          <CardDescription>Acompanhe o registro de quem executou cada etapa.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[40%] pl-6">Tarefa</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead className="text-right pr-6">Horário</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => {
                const completion = completions.find((c) => c.task_id === task.id)
                const isCompleted = !!completion
                const completedLate =
                  isCompleted && wasCompletedLate(completion!.completed_at, task.expected_time)
                const overdue = !isCompleted && isTaskOverdue(task.expected_time, false)
                return (
                  <TableRow key={task.id} className="hover:bg-muted/30">
                    <TableCell className="pl-6">
                      <div className="font-medium text-foreground">{task.title}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {CATEGORY_LABELS[task.category] || task.category}
                      </div>
                    </TableCell>
                    <TableCell>
                      {isCompleted ? (
                        <Badge
                          variant="outline"
                          className={
                            completedLate
                              ? 'bg-orange-50 text-orange-700 border-orange-200'
                              : 'bg-primary/5 text-primary border-primary/20'
                          }
                        >
                          {completedLate ? 'Concluída com Atraso' : 'Concluído'}
                        </Badge>
                      ) : overdue ? (
                        <Badge
                          variant="outline"
                          className="bg-destructive/5 text-destructive border-destructive/20"
                        >
                          Atrasada
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-muted text-muted-foreground border-border/50"
                        >
                          Pendente
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {isCompleted ? (
                        <span className="text-sm font-medium">
                          {completion.profiles?.full_name || 'Usuário'}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      {isCompleted ? (
                        <span className="text-sm font-medium">
                          {new Date(completion.completed_at).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      ) : task.expected_time ? (
                        <span className="text-xs text-muted-foreground">
                          Até {task.expected_time.slice(0, 5)}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
              {tasks.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                    Nenhuma tarefa configurada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <DelayedTasksList stats={stats.frequentlyDelayed} />
    </div>
  )
}
