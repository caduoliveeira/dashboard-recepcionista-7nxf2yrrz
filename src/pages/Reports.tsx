import { useState, useEffect } from 'react'
import { fetchTasks, fetchTodayCompletions, Task, TaskCompletion } from '@/services/tasks'
import { useAuth } from '@/hooks/use-auth'
import { Navigate } from 'react-router-dom'
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
import { CheckCircle2, Clock, AlertTriangle, Activity } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

export default function Reports() {
  const { role } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [completions, setCompletions] = useState<TaskCompletion[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    const [tasksRes, completionsRes] = await Promise.all([fetchTasks(), fetchTodayCompletions()])
    if (tasksRes.data) setTasks(tasksRes.data)
    if (completionsRes.data) setCompletions(completionsRes.data)
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-[400px]" />
      </div>
    )
  }

  const completedCount = completions.length
  const totalCount = tasks.length
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  // Calculate late tasks
  let lateCount = 0
  tasks.forEach((task) => {
    const completion = completions.find((c) => c.task_id === task.id)
    if (completion && task.expected_time) {
      const completedDate = new Date(completion.completed_at)
      const expectedHour = parseInt(task.expected_time.split(':')[0], 10)
      const expectedMin = parseInt(task.expected_time.split(':')[1], 10)

      const expectedDate = new Date(completion.completed_at)
      expectedDate.setHours(expectedHour, expectedMin, 0, 0)

      if (completedDate > expectedDate) {
        lateCount++
      }
    } else if (!completion && task.expected_time) {
      // Check if it's past expected time right now
      const now = new Date()
      const expectedHour = parseInt(task.expected_time.split(':')[0], 10)
      const expectedMin = parseInt(task.expected_time.split(':')[1], 10)
      const expectedDate = new Date()
      expectedDate.setHours(expectedHour, expectedMin, 0, 0)

      if (now > expectedDate) {
        lateCount++
      }
    }
  })

  const categoryLabels: Record<string, string> = {
    Opening: 'Abertura',
    Shift: 'Turno',
    Closing: 'Fechamento',
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Relatório de Performance
          </h1>
          <p className="text-muted-foreground mt-1">
            Acompanhamento da execução da rotina da academia hoje.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full border">
          <Clock className="h-4 w-4" />
          {new Date().toLocaleDateString('pt-BR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          })}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border/60 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Activity className="w-24 h-24" />
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
              {completedCount} de {totalCount} tarefas finalizadas
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <CheckCircle2 className="w-24 h-24" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Status Atual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tighter">
                {totalCount - completedCount}
              </span>
              <span className="text-sm font-medium text-muted-foreground">Pendentes</span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {['Opening', 'Shift', 'Closing'].map((cat) => {
                const total = tasks.filter((t) => t.category === cat).length
                const comp = completions.filter(
                  (c) => tasks.find((t) => t.id === c.task_id)?.category === cat,
                ).length
                if (total === 0) return null
                return (
                  <Badge key={cat} variant="secondary" className="text-[10px]">
                    {categoryLabels[cat]}: {comp}/{total}
                  </Badge>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 text-orange-600">
            <AlertTriangle className="w-24 h-24" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Atenção</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span
                className={cn(
                  'text-3xl font-bold tracking-tighter',
                  lateCount > 0 ? 'text-orange-600' : 'text-green-600',
                )}
              >
                {lateCount}
              </span>
              <span className="text-sm font-medium text-muted-foreground">Tarefas Atrasadas</span>
            </div>
            <p className="text-xs text-muted-foreground mt-4 font-medium">
              {lateCount === 0
                ? 'Rotina dentro do horário esperado.'
                : 'Atenção aos horários limite das tarefas.'}
            </p>
          </CardContent>
        </Card>
      </div>

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

                let isLate = false
                if (isCompleted && task.expected_time) {
                  const completedDate = new Date(completion.completed_at)
                  const expectedHour = parseInt(task.expected_time.split(':')[0], 10)
                  const expectedMin = parseInt(task.expected_time.split(':')[1], 10)

                  const expectedDate = new Date(completion.completed_at)
                  expectedDate.setHours(expectedHour, expectedMin, 0, 0)

                  if (completedDate > expectedDate) {
                    isLate = true
                  }
                } else if (!isCompleted && task.expected_time) {
                  const now = new Date()
                  const expectedHour = parseInt(task.expected_time.split(':')[0], 10)
                  const expectedMin = parseInt(task.expected_time.split(':')[1], 10)
                  const expectedDate = new Date()
                  expectedDate.setHours(expectedHour, expectedMin, 0, 0)

                  if (now > expectedDate) {
                    isLate = true
                  }
                }

                return (
                  <TableRow key={task.id} className="hover:bg-muted/30">
                    <TableCell className="pl-6">
                      <div className="font-medium text-foreground">{task.title}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {categoryLabels[task.category]}
                      </div>
                    </TableCell>
                    <TableCell>
                      {isCompleted ? (
                        <Badge
                          variant="outline"
                          className="bg-primary/5 text-primary border-primary/20"
                        >
                          Concluído
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
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-sm font-medium">
                            {new Date(completion.completed_at).toLocaleTimeString('pt-BR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          {isLate && (
                            <span className="text-[10px] font-semibold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">
                              Atrasado
                            </span>
                          )}
                        </div>
                      ) : task.expected_time ? (
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-xs text-muted-foreground">
                            Até {task.expected_time.slice(0, 5)}
                          </span>
                          {isLate && (
                            <span className="text-[10px] font-semibold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">
                              Atrasado
                            </span>
                          )}
                        </div>
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
    </div>
  )
}
