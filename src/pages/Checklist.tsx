import { useState, useEffect, useMemo } from 'react'
import {
  fetchTasks,
  fetchTodayCompletions,
  markTaskComplete,
  type Task,
  type TaskCompletion,
} from '@/services/tasks'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Clock, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { TaskCreationModal } from '@/components/task-creation-modal'
import { ChecklistTaskItem } from '@/components/checklist-task-item'
import { ChecklistFilterBar } from '@/components/checklist-filter-bar'
import { shouldShowTask, type FilterType } from '@/lib/task-utils'

const KNOWN_ORDER = ['Opening', 'Shift', 'Closing']
const KNOWN_LABELS: Record<string, string> = {
  Opening: 'Abertura',
  Shift: 'Turno',
  Closing: 'Fechamento',
}

export default function Checklist() {
  const { user, role } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [completions, setCompletions] = useState<TaskCompletion[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [filter, setFilter] = useState<FilterType>('all')
  const [, setNow] = useState(Date.now())
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60000)
    return () => clearInterval(timer)
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

  const completedIds = useMemo(() => new Set(completions.map((c) => c.task_id)), [completions])

  const filterCounts = useMemo(() => {
    const counts: Record<FilterType, number> = { all: 0, now: 0, upcoming: 0, completed: 0 }
    tasks.forEach((t) => {
      const isCompleted = completedIds.has(t.id)
      counts.all++
      if (shouldShowTask(t.expected_time, isCompleted, 'now')) counts.now++
      if (shouldShowTask(t.expected_time, isCompleted, 'upcoming')) counts.upcoming++
      if (isCompleted) counts.completed++
    })
    return counts
  }, [tasks, completedIds])

  const filteredTasks = useMemo(
    () => tasks.filter((t) => shouldShowTask(t.expected_time, completedIds.has(t.id), filter)),
    [tasks, completedIds, filter],
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64 mb-2" />
        <Skeleton className="h-12 w-full" />
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-[400px] rounded-xl" />
          <Skeleton className="h-[400px] rounded-xl" />
          <Skeleton className="h-[400px] rounded-xl" />
        </div>
      </div>
    )
  }

  const allCats = Array.from(new Set(filteredTasks.map((t) => t.category)))
  const categories = [
    ...KNOWN_ORDER.filter((c) => allCats.includes(c)),
    ...allCats.filter((c) => !KNOWN_ORDER.includes(c)).sort(),
  ]
  const getLabel = (cat: string) => KNOWN_LABELS[cat] || cat

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Checklist Diário</h1>
          <p className="text-muted-foreground mt-1">
            Marque as tarefas conforme forem concluídas na sua rotina.
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
          {role === 'owner' && (
            <Button onClick={() => setModalOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" /> Nova Tarefa
            </Button>
          )}
        </div>
      </div>

      <ChecklistFilterBar value={filter} onChange={setFilter} counts={filterCounts} />

      {filteredTasks.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center text-muted-foreground">
            Nenhuma tarefa encontrada para este filtro.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-3 items-start">
          {categories.map((category) => {
            const catTasks = filteredTasks.filter((t) => t.category === category)
            if (catTasks.length === 0) return null
            const completedCount = catTasks.filter((t) => completedIds.has(t.id)).length
            const isAllCompleted = completedCount === catTasks.length && catTasks.length > 0
            return (
              <Card
                key={category}
                className={cn(
                  'shadow-sm transition-all duration-300',
                  isAllCompleted && 'border-primary/50 bg-primary/5',
                )}
              >
                <CardHeader className="border-b bg-card pb-4">
                  <CardTitle className="text-lg font-semibold flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      {isAllCompleted && <CheckCircle2 className="h-5 w-5 text-primary" />}
                      {getLabel(category)}
                    </span>
                    <Badge
                      variant={isAllCompleted ? 'default' : 'secondary'}
                      className={cn('ml-auto', isAllCompleted && 'bg-primary')}
                    >
                      {completedCount} / {catTasks.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ul className="divide-y">
                    {catTasks.map((task) => (
                      <ChecklistTaskItem
                        key={task.id}
                        task={task}
                        completion={completions.find((c) => c.task_id === task.id)}
                        onComplete={handleComplete}
                      />
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <TaskCreationModal open={modalOpen} onOpenChange={setModalOpen} onTaskCreated={loadData} />
    </div>
  )
}
