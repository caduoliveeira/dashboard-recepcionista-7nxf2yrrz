import { useState, useEffect, useMemo } from 'react'
import {
  fetchTasks,
  fetchTodayCompletions,
  markTaskComplete,
  fetchTodayActivity,
  type Task,
  type TaskCompletion,
  type ActivityItem,
} from '@/services/tasks'
import {
  fetchCategories as fetchTaskCategories,
  type TaskCategory,
} from '@/services/task-categories'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { CheckCircle2, Clock, Plus, Settings2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { TaskCreationModal } from '@/components/task-creation-modal'
import { CategoryManagementModal } from '@/components/category-management-modal'
import { ChecklistTaskItem } from '@/components/checklist-task-item'
import { ChecklistFilterBar } from '@/components/checklist-filter-bar'
import { ActivityFeed } from '@/components/activity-feed'
import { ShiftHandoverNotes } from '@/components/shift-handover-notes'
import { shouldShowTask, shouldShowTaskToday, type FilterType } from '@/lib/task-utils'
import { supabase } from '@/lib/supabase/client'

const formatTimeRange = (start: string | null, end: string | null) => {
  if (!start && !end) return ''
  const fmt = (t: string | null) => (t ? t.substring(0, 5) : '')
  return `(${fmt(start)} - ${fmt(end)})`
}

export default function Checklist() {
  const { user, role } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [categories, setCategories] = useState<TaskCategory[]>([])
  const [completions, setCompletions] = useState<TaskCompletion[]>([])
  const [activity, setActivity] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [categoryModalOpen, setCategoryModalOpen] = useState(false)
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

  useEffect(() => {
    const channel = supabase
      .channel('task-activity-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'task_completions' },
        () => {
          fetchTodayActivity().then(({ data }) => {
            if (data) setActivity(data)
          })
        },
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'task_exceptions' },
        () => {
          fetchTodayActivity().then(({ data }) => {
            if (data) setActivity(data)
          })
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const loadData = async () => {
    setLoading(true)
    const [tasksRes, catsRes, completionsRes, activityRes] = await Promise.all([
      fetchTasks(),
      fetchTaskCategories(),
      fetchTodayCompletions(),
      fetchTodayActivity(),
    ])
    if (tasksRes.data) setTasks(tasksRes.data)
    if (catsRes.data) setCategories(catsRes.data)
    if (completionsRes.data) setCompletions(completionsRes.data)
    if (activityRes.data) setActivity(activityRes.data)
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
      fetchTodayActivity().then(({ data: act }) => {
        if (act) setActivity(act)
      })
      toast({ title: 'Sucesso', description: 'Tarefa concluída!' })
    }
  }

  const completedIds = useMemo(() => new Set(completions.map((c) => c.task_id)), [completions])

  const filterCounts = useMemo(() => {
    const counts: Record<FilterType, number> = { all: 0, now: 0, upcoming: 0, completed: 0 }
    tasks.forEach((t) => {
      if (!shouldShowTaskToday(t.recurrence_days)) return
      const isCompleted = completedIds.has(t.id)
      counts.all++
      if (shouldShowTask(t.expected_time, isCompleted, 'now')) counts.now++
      if (shouldShowTask(t.expected_time, isCompleted, 'upcoming')) counts.upcoming++
      if (isCompleted) counts.completed++
    })
    return counts
  }, [tasks, completedIds])

  const filteredTasks = useMemo(
    () =>
      tasks.filter(
        (t) =>
          shouldShowTask(t.expected_time, completedIds.has(t.id), filter) &&
          shouldShowTaskToday(t.recurrence_days),
      ),
    [tasks, completedIds, filter],
  )

  const columns = useMemo(() => {
    const cols = categories.map((cat) => ({
      category: cat,
      catTasks: filteredTasks.filter((t) => t.category_id === cat.id),
    }))
    const uncategorized = filteredTasks.filter((t) => !t.category_id)
    if (uncategorized.length > 0) {
      cols.push({ category: null, catTasks: uncategorized })
    }
    return cols
  }, [categories, filteredTasks])

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
              <Button
                variant="outline"
                onClick={() => setCategoryModalOpen(true)}
                className="gap-2"
              >
                <Settings2 className="h-4 w-4" /> Turnos
              </Button>
              <Button onClick={() => setModalOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" /> Nova Tarefa
              </Button>
            </>
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
        <div className="flex gap-6">
          <div className="flex-1 grid gap-6 md:grid-cols-2 xl:grid-cols-3 items-start">
            {columns.map((col) => {
              const completedCount = col.catTasks.filter((t) => completedIds.has(t.id)).length
              const total = col.catTasks.length
              const isAllCompleted = total > 0 && completedCount === total
              const progress = total > 0 ? (completedCount / total) * 100 : 0
              return (
                <Card
                  key={col.category?.id || 'general'}
                  className={cn(
                    'shadow-sm transition-all duration-300',
                    isAllCompleted && 'border-primary/50 bg-primary/5',
                  )}
                >
                  <CardHeader className="border-b bg-card pb-4 space-y-2">
                    <CardTitle className="text-lg font-semibold flex items-center justify-between">
                      <span className="flex items-center gap-2 flex-wrap">
                        {isAllCompleted && <CheckCircle2 className="h-5 w-5 text-primary" />}
                        {col.category ? col.category.name : 'Geral'}
                        {col.category && (
                          <span className="text-xs font-normal text-muted-foreground">
                            {formatTimeRange(col.category.start_time, col.category.end_time)}
                          </span>
                        )}
                      </span>
                      <Badge
                        variant={isAllCompleted ? 'default' : 'secondary'}
                        className={cn('ml-auto', isAllCompleted && 'bg-primary')}
                      >
                        {completedCount} / {total}
                      </Badge>
                    </CardTitle>
                    {total > 0 && <Progress value={progress} className="h-1.5" />}
                  </CardHeader>
                  <CardContent className="p-0">
                    <ul className="divide-y">
                      {col.catTasks.map((task) => (
                        <ChecklistTaskItem
                          key={task.id}
                          task={task}
                          completion={completions.find((c) => c.task_id === task.id)}
                          onComplete={handleComplete}
                        />
                      ))}
                    </ul>
                    {col.category && (
                      <ShiftHandoverNotes categoryId={col.category.id} userId={user?.id} />
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
          <ActivityFeed items={activity} />
        </div>
      )}

      <TaskCreationModal open={modalOpen} onOpenChange={setModalOpen} onTaskCreated={loadData} />
      <CategoryManagementModal
        open={categoryModalOpen}
        onOpenChange={setCategoryModalOpen}
        onCategoriesChanged={loadData}
      />
    </div>
  )
}
