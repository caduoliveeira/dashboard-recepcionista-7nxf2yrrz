import { useState, useEffect, useMemo } from 'react'
import {
  fetchTasks,
  fetchTodayCompletions,
  markTaskComplete,
  type Task,
  type TaskCompletion,
} from '@/services/tasks'
import { fetchTaskCategories, type TaskCategory } from '@/services/task-categories'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Clock, Plus, Settings2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { TaskCreationModal } from '@/components/task-creation-modal'
import { ChecklistTaskItem } from '@/components/checklist-task-item'
import { ChecklistFilterBar } from '@/components/checklist-filter-bar'
import { CategoryManagementModal } from '@/components/category-management-modal'
import { shouldShowTask, type FilterType } from '@/lib/task-utils'

const fmtTime = (t: string | null) => (t ? t.substring(0, 5) : '--:--')

function timeRange(start: string | null, end: string | null): string | null {
  if (!start && !end) return null
  if (start && end) return `${fmtTime(start)} às ${fmtTime(end)}`
  if (start) return `A partir das ${fmtTime(start)}`
  return `Até as ${fmtTime(end)}`
}

export default function Checklist() {
  const { user, role } = useAuth()
  const { toast } = useToast()
  const [tasks, setTasks] = useState<Task[]>([])
  const [completions, setCompletions] = useState<TaskCompletion[]>([])
  const [categories, setCategories] = useState<TaskCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [catModalOpen, setCatModalOpen] = useState(false)
  const [filter, setFilter] = useState<FilterType>('all')
  const [, setNow] = useState(Date.now())

  useEffect(() => {
    loadData()
  }, [])
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60000)
    return () => clearInterval(t)
  }, [])

  const loadData = async () => {
    setLoading(true)
    const [t, c, cats] = await Promise.all([
      fetchTasks(),
      fetchTodayCompletions(),
      fetchTaskCategories(),
    ])
    if (t.data) setTasks(t.data)
    if (c.data) setCompletions(c.data)
    if (cats.data) setCategories(cats.data)
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
      setCompletions((p) => [...p, data])
      toast({ title: 'Sucesso', description: 'Tarefa concluída!' })
    }
  }

  const completedIds = useMemo(() => new Set(completions.map((c) => c.task_id)), [completions])

  const filterCounts = useMemo(() => {
    const counts: Record<FilterType, number> = { all: 0, now: 0, upcoming: 0, completed: 0 }
    tasks.forEach((t) => {
      const done = completedIds.has(t.id)
      counts.all++
      if (shouldShowTask(t.expected_time, done, 'now')) counts.now++
      if (shouldShowTask(t.expected_time, done, 'upcoming')) counts.upcoming++
      if (done) counts.completed++
    })
    return counts
  }, [tasks, completedIds])

  const filteredTasks = useMemo(
    () => tasks.filter((t) => shouldShowTask(t.expected_time, completedIds.has(t.id), filter)),
    [tasks, completedIds, filter],
  )

  const grouped = useMemo(() => {
    const map = new Map(categories.map((c) => [c.id, c]))
    const byId = new Map<string, Task[]>()
    const other: Task[] = []
    filteredTasks.forEach((t) => {
      if (t.category_id && map.has(t.category_id)) {
        const a = byId.get(t.category_id) || []
        a.push(t)
        byId.set(t.category_id, a)
      } else other.push(t)
    })
    const sorted = [...categories].sort((a, b) =>
      (a.start_time || '99').localeCompare(b.start_time || '99'),
    )
    const groups: { cat: TaskCategory | null; tasks: Task[] }[] = []
    sorted.forEach((c) => {
      const ts = byId.get(c.id)
      if (ts?.length) groups.push({ cat: c, tasks: ts })
    })
    if (other.length) groups.push({ cat: null, tasks: other })
    return groups
  }, [filteredTasks, categories])

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
            <>
              <Button variant="outline" onClick={() => setCatModalOpen(true)} className="gap-2">
                <Settings2 className="h-4 w-4" /> Categorias
              </Button>
              <Button onClick={() => setModalOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" /> Nova Tarefa
              </Button>
            </>
          )}
        </div>
      </div>

      <ChecklistFilterBar value={filter} onChange={setFilter} counts={filterCounts} />

      {grouped.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center text-muted-foreground">
            Nenhuma tarefa encontrada para este filtro.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-3 items-start">
          {grouped.map(({ cat, tasks: catTasks }) => {
            const done = catTasks.filter((t) => completedIds.has(t.id)).length
            const allDone = done === catTasks.length && catTasks.length > 0
            const range = cat ? timeRange(cat.start_time, cat.end_time) : null
            return (
              <Card
                key={cat?.id || 'other'}
                className={cn(
                  'shadow-sm transition-all duration-300',
                  allDone && 'border-primary/50 bg-primary/5',
                )}
              >
                <CardHeader className="border-b bg-card pb-4">
                  <CardTitle className="text-lg font-semibold flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      {allDone && <CheckCircle2 className="h-5 w-5 text-primary" />}
                      {cat?.name || 'Sem Categoria'}
                    </span>
                    <Badge
                      variant={allDone ? 'default' : 'secondary'}
                      className={cn('ml-auto', allDone && 'bg-primary')}
                    >
                      {done} / {catTasks.length}
                    </Badge>
                  </CardTitle>
                  {range && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <Clock className="h-3 w-3" />
                      {range}
                    </p>
                  )}
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
      <CategoryManagementModal
        open={catModalOpen}
        onOpenChange={setCatModalOpen}
        onCategoriesChanged={loadData}
      />
    </div>
  )
}
