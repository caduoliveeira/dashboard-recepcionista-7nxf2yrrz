import { useState, useEffect } from 'react'
import {
  fetchTasks,
  fetchTodayCompletions,
  markTaskComplete,
  Task,
  TaskCompletion,
} from '@/services/tasks'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Circle, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'

export default function Checklist() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [completions, setCompletions] = useState<TaskCompletion[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

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

  const handleComplete = async (taskId: string) => {
    if (!user) return
    const { data, error } = await markTaskComplete(taskId, user.id)
    if (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível completar a tarefa.',
        variant: 'destructive',
      })
      return
    }
    if (data) {
      setCompletions((prev) => [...prev, data])
      toast({ title: 'Sucesso', description: 'Tarefa concluída!' })
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-[400px] rounded-xl" />
          <Skeleton className="h-[400px] rounded-xl" />
          <Skeleton className="h-[400px] rounded-xl" />
        </div>
      </div>
    )
  }

  const categories = ['Opening', 'Shift', 'Closing']
  const categoryLabels: Record<string, string> = {
    Opening: 'Abertura',
    Shift: 'Turno',
    Closing: 'Fechamento',
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Checklist Diário</h1>
          <p className="text-muted-foreground mt-1">
            Marque as tarefas conforme forem concluídas na sua rotina.
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

      <div className="grid gap-6 md:grid-cols-3 items-start">
        {categories.map((category) => {
          const catTasks = tasks.filter((t) => t.category === category)
          if (catTasks.length === 0) return null

          const completedCount = completions.filter((c) =>
            catTasks.some((t) => t.id === c.task_id),
          ).length
          const isAllCompleted = completedCount === catTasks.length && catTasks.length > 0

          return (
            <Card
              key={category}
              className={cn(
                'shadow-sm transition-all duration-300',
                isAllCompleted ? 'border-primary/50 bg-primary/5' : '',
              )}
            >
              <CardHeader className="border-b bg-card pb-4">
                <CardTitle className="text-lg font-semibold flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    {isAllCompleted && <CheckCircle2 className="h-5 w-5 text-primary" />}
                    {categoryLabels[category]}
                  </span>
                  <Badge
                    variant={isAllCompleted ? 'default' : 'secondary'}
                    className={cn('ml-auto', isAllCompleted ? 'bg-primary' : '')}
                  >
                    {completedCount} / {catTasks.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ul className="divide-y">
                  {catTasks.map((task) => {
                    const completion = completions.find((c) => c.task_id === task.id)
                    const isCompleted = !!completion

                    return (
                      <li
                        key={task.id}
                        className={cn(
                          'p-4 transition-colors',
                          isCompleted ? 'bg-card/50' : 'hover:bg-muted/30',
                        )}
                      >
                        <div className="flex items-start gap-4">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleComplete(task.id)}
                            disabled={isCompleted}
                            className={cn(
                              'h-8 w-8 mt-0.5 shrink-0 transition-all rounded-full',
                              isCompleted
                                ? 'text-primary hover:text-primary cursor-default opacity-100'
                                : 'text-muted-foreground hover:text-primary hover:bg-primary/10',
                            )}
                          >
                            {isCompleted ? (
                              <CheckCircle2 className="h-7 w-7" />
                            ) : (
                              <Circle className="h-7 w-7 stroke-[1.5]" />
                            )}
                          </Button>
                          <div className="space-y-1.5 flex-1 pt-1">
                            <p
                              className={cn(
                                'font-medium text-[15px] leading-tight transition-all',
                                isCompleted
                                  ? 'text-muted-foreground line-through decoration-muted-foreground/30'
                                  : 'text-foreground',
                              )}
                            >
                              {task.title}
                            </p>
                            {task.description && (
                              <p
                                className={cn(
                                  'text-sm transition-all',
                                  isCompleted
                                    ? 'text-muted-foreground/60'
                                    : 'text-muted-foreground',
                                )}
                              >
                                {task.description}
                              </p>
                            )}
                            {task.expected_time && !isCompleted && (
                              <div className="flex items-center text-[11px] font-medium text-orange-600/80 bg-orange-50 w-fit px-1.5 py-0.5 rounded border border-orange-100 mt-2">
                                <Clock className="h-3 w-3 mr-1" />
                                Esperado até: {task.expected_time.slice(0, 5)}
                              </div>
                            )}
                            {isCompleted && (
                              <div className="flex items-center gap-1.5 text-[11px] text-primary/80 font-medium mt-2 bg-primary/5 w-fit px-2 py-0.5 rounded-full border border-primary/10">
                                ✓ Concluído às{' '}
                                {new Date(completion.completed_at).toLocaleTimeString('pt-BR', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
