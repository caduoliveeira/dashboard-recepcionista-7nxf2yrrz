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
import { fetchTodaySkippedTaskIds } from '@/services/task-exceptions'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Clock, Plus, Settings2, AlertTriangle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Skeleton } from '@/components/ui/skeleton'
import { TaskCreationModal } from '@/components/task-creation-modal'
import { CategoryManagementModal } from '@/components/category-management-modal'
import { ChecklistFilterBar } from '@/components/checklist-filter-bar'
import { ActivityFeed } from '@/components/activity-feed'
import { TimelineView } from '@/components/timeline-view'
import { shouldShowTask, shouldShowTaskToday, type FilterType } from '@/lib/task-utils'
import { supabase } from '@/lib/supabase/client'

export default function Checklist() {
  const { user, role } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [completions, setCompletions] = useState<TaskCompletion[]>([])
  const [skippedIds, setSkippedIds] = useState<Set<string>>(new Set())
  const [activity, setActivity] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
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
        () => refreshActivity(),
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'task_exceptions' },
        () => {
          refreshActivity()
          refreshSkipped()
        },
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const refreshActivity = () => {
    fetchTodayActivity().then(({ data }) => {
      if (data) setActivity(data)
    })
  }

  const refreshSkipped = () => {
    fetchTodaySkippedTaskIds().then(({ data }) => {
      setSkippedIds(new Set(data || []))
    })
  }

  const loadData = async () => {
    setLoading(true)
    setError(false)
    try {
      const [tasksRes, completionsRes, activityRes, skippedRes] = await Promise.all([
        fetchTasks(),
        fetchTodayCompletions(),
        fetchTodayActivity(),
        fetchTodaySkippedTaskIds(),
      ])
      if (tasksRes.error || completionsRes.error || activityRes.error || skippedRes.error) {
        setError(true)
      } else {
        setTasks(tasksRes.data ?? [])
        setCompletions(completionsRes.data ?? [])
        setActivity(activityRes.data ?? [])
        setSkippedIds(new Set(skippedRes.data ?? []))
      }
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
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
      refreshActivity()
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
    refreshActivity()
    toast({ title: 'Sucesso', description: 'Tarefa excluída com sucesso!' })
  }

  const completedIds = useMemo(
    () => new Set((completions || []).map((c) => c.task_id)),
    [completions],
  )

  const filterCounts = useMemo(() => {
    const counts: Record<FilterType, number> = { all: 0, now: 0, upcoming: 0, completed: 0 }
    ;(tasks || []).forEach((t) => {
      if (!shouldShowTaskToday(t.recurrence_days, t.scheduled_date)) return
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
      (tasks || []).filter(
        (t) =>
          shouldShowTask(t.expected_time, completedIds.has(t.id), filter) &&
          shouldShowTaskToday(t.recurrence_days, t.scheduled_date),
      ),
    [tasks, completedIds, filter],
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64 mb-2 bg-muted" />
        <Skeleton className="h-12 w-full bg-muted" />
        <div className="space-y-4 mt-8">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl bg-muted" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center border border-destructive/20 shadow-sm">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold text-foreground tracking-tight">
          Falha ao carregar tarefas
        </h2>
        <p className="text-muted-foreground max-w-md text-sm">
          Não foi possível carregar os dados do servidor. Verifique sua conexão e tente novamente.
        </p>
        <Button onClick={loadData} variant="outline" className="mt-4 gap-2 border-border">
          Tentar Novamente
        </Button>
      </div>
    )
  }

  return (
    <div className="relative animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none opacity-50" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-secondary/30 rounded-full blur-[100px] pointer-events-none opacity-50" />

      <div className="relative z-10 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-border">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-[10px] font-extrabold tracking-widest uppercase mb-1 shadow-sm">
              <CheckCircle2 className="h-3.5 w-3.5" /> Operação Diária
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
              Checklist de Rotina
            </h1>
            <p className="text-muted-foreground font-medium tracking-wide text-sm">
              Linha do tempo operacional — 05:00 às 23:00
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground bg-card/80 backdrop-blur-2xl px-5 py-2.5 rounded-full border border-border shadow-sm hidden sm:flex">
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
                className="gap-2 h-10 px-6 rounded-full bg-card/80 backdrop-blur-md border-border hover:bg-muted text-xs font-bold uppercase tracking-wider text-foreground transition-all duration-300 shadow-sm"
              >
                <Settings2 className="h-4 w-4" /> Configurar Turnos
              </Button>
            )}
            <Button
              onClick={() => setModalOpen(true)}
              className="gap-2 h-10 px-6 rounded-full shadow-md bg-primary hover:bg-primary-hover text-primary-foreground font-bold tracking-wider text-xs uppercase border-none transition-all duration-300 hover:scale-105"
            >
              <Plus className="h-4 w-4" strokeWidth={3} /> Nova Tarefa
            </Button>
          </div>
        </div>

        <ChecklistFilterBar value={filter} onChange={setFilter} counts={filterCounts} />

        <TimelineView
          tasks={filteredTasks}
          completions={completions}
          skippedIds={skippedIds}
          onComplete={handleComplete}
          canDelete={role === 'owner'}
          onDelete={handleDelete}
        />

        <div className="w-full mt-4">
          <ActivityFeed items={activity} />
        </div>
      </div>

      <TaskCreationModal open={modalOpen} onOpenChange={setModalOpen} onTaskCreated={loadData} />
      <CategoryManagementModal
        open={categoryModalOpen}
        onOpenChange={setCategoryModalOpen}
        onCategoriesChanged={loadData}
      />
    </div>
  )
}
