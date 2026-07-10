import { useState, useEffect, useMemo } from 'react'
import {
  fetchTasks,
  fetchTodayCompletions,
  markTaskComplete,
  deleteTask,
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

  const handleDelete = async (taskId: string) => {
    const { error } = await deleteTask(taskId)
    if (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir a tarefa.',
        variant: 'destructive',
      })
      return
    }
    setTasks((prev) => prev.filter((t) => t.id !== taskId))
    setCompletions((prev) => prev.filter((c) => c.task_id !== taskId))
    fetchTodayActivity().then(({ data: act }) => {
      if (act) setActivity(act)
    })
    toast({ title: 'Sucesso', description: 'Tarefa excluída com sucesso!' })
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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200/60">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold tracking-[0.2em] uppercase mb-2">
            <CheckCircle2 className="h-3 w-3" />
            Operação Diária
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 font-display">
            Checklist de Rotina
          </h1>
          <p className="text-slate-500 font-medium tracking-wide text-sm">
            Gestão e acompanhamento das tarefas e processos do clube.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-600 bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm hidden sm:flex">
            <Clock className="h-4 w-4 text-primary" />
            {new Date().toLocaleDateString('pt-BR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </div>
          {role === 'owner' && (
            <Button
              variant="outline"
              onClick={() => setCategoryModalOpen(true)}
              className="gap-2 h-10 px-5 rounded-xl bg-white hover:bg-slate-50 border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-700 shadow-sm"
            >
              <Settings2 className="h-4 w-4" /> Configurar Turnos
            </Button>
          )}
          <Button
            onClick={() => setModalOpen(true)}
            className="gap-2 h-10 px-6 rounded-xl shadow-glow bg-primary hover:bg-primary/90 text-white font-semibold tracking-wider text-xs uppercase"
          >
            <Plus className="h-4 w-4" strokeWidth={3} /> Nova Tarefa
          </Button>
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
                    'shadow-elevation border-slate-200/60 transition-all duration-500 rounded-2xl overflow-hidden bg-white',
                    isAllCompleted &&
                      'border-primary/30 shadow-[0_10px_40px_-10px_rgba(128,0,32,0.1)]',
                  )}
                >
                  <div
                    className={cn(
                      'h-1.5 w-full transition-all duration-500',
                      isAllCompleted ? 'bg-primary' : 'bg-slate-100',
                    )}
                  />
                  <CardHeader className="border-b border-slate-100 bg-white pb-5 pt-5 space-y-4">
                    <CardTitle className="text-xl font-bold font-display flex items-center justify-between tracking-tight text-slate-800">
                      <span className="flex items-center gap-2 flex-wrap">
                        {isAllCompleted && (
                          <CheckCircle2 className="h-6 w-6 text-primary" strokeWidth={2.5} />
                        )}
                        {col.category ? col.category.name : 'Geral'}
                        {col.category && (
                          <span className="text-xs font-semibold tracking-widest uppercase text-slate-400 bg-slate-50 px-2 py-1 rounded-md ml-2">
                            {formatTimeRange(col.category.start_time, col.category.end_time)}
                          </span>
                        )}
                      </span>
                      <Badge
                        variant={isAllCompleted ? 'default' : 'secondary'}
                        className={cn(
                          'ml-auto text-xs font-bold px-3 py-1 rounded-full shadow-sm',
                          isAllCompleted
                            ? 'bg-primary text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
                        )}
                      >
                        {completedCount} / {total}
                      </Badge>
                    </CardTitle>
                    {total > 0 && (
                      <Progress value={progress} className="h-2 bg-slate-100 [&>div]:bg-primary" />
                    )}
                  </CardHeader>
                  <CardContent className="p-0 bg-slate-50/30">
                    <ul className="divide-y">
                      {col.catTasks.map((task) => (
                        <ChecklistTaskItem
                          key={task.id}
                          task={task}
                          completion={completions.find((c) => c.task_id === task.id)}
                          onComplete={handleComplete}
                          onDelete={handleDelete}
                          canDelete={role === 'owner'}
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
