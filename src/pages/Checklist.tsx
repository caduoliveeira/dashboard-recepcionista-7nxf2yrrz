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
    const sortedCategories = [...categories].sort((a, b) => {
      const aIsDaily = a.name.toLowerCase().includes('diár')
      const bIsDaily = b.name.toLowerCase().includes('diár')
      if (aIsDaily && !bIsDaily) return -1
      if (!aIsDaily && bIsDaily) return 1
      const aStart = a.start_time || '24:00'
      const bStart = b.start_time || '24:00'
      return aStart.localeCompare(bStart)
    })

    const cols = sortedCategories.map((cat) => ({
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
        <Skeleton className="h-10 w-64 mb-2 bg-white/5" />
        <Skeleton className="h-12 w-full bg-white/5" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-[400px] rounded-2xl bg-white/5" />
          <Skeleton className="h-[400px] rounded-2xl bg-white/5" />
          <Skeleton className="h-[400px] rounded-2xl bg-white/5" />
          <Skeleton className="h-[400px] rounded-2xl bg-white/5" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 relative">
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -z-10 pointer-events-none opacity-50" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] -z-10 pointer-events-none opacity-50" />

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/5">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/[0.08] text-primary border border-primary/20 text-[10px] font-extrabold tracking-widest uppercase mb-1 shadow-[0_0_15px_rgba(128,0,32,0.15)]">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Operação Diária
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white font-display">
            Checklist de Rotina
          </h1>
          <p className="text-white/50 font-medium tracking-wide text-sm">
            Gestão e acompanhamento das tarefas e processos do clube.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <div className="flex items-center gap-2 text-xs font-medium text-white/50 bg-[#0a0a0a]/80 backdrop-blur-2xl px-5 py-2.5 rounded-full border border-white/10 shadow-sm hidden sm:flex">
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
              className="gap-2 h-10 px-6 rounded-full bg-transparent border-white/20 hover:bg-white/5 hover:border-white/30 text-xs font-bold uppercase tracking-wider text-white transition-all duration-300"
            >
              <Settings2 className="h-4 w-4" /> Configurar Turnos
            </Button>
          )}
          <Button
            onClick={() => setModalOpen(true)}
            className="gap-2 h-10 px-6 rounded-full shadow-[0_4px_20px_rgba(128,0,32,0.4)] bg-primary hover:bg-primary/90 text-white font-bold tracking-wider text-xs uppercase border-none transition-all duration-300 hover:scale-105"
          >
            <Plus className="h-4 w-4" strokeWidth={3} /> Nova Tarefa
          </Button>
        </div>
      </div>
      <ChecklistFilterBar value={filter} onChange={setFilter} counts={filterCounts} />

      {filteredTasks.length === 0 ? (
        <div className="space-y-8">
          <Card className="border-dashed border-white/10 bg-transparent">
            <CardContent className="py-12 text-center text-muted-foreground">
              Nenhuma tarefa encontrada para este filtro.
            </CardContent>
          </Card>
          <ActivityFeed items={activity} />
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 items-start">
            {' '}
            {columns.map((col) => {
              const completedCount = col.catTasks.filter((t) => completedIds.has(t.id)).length
              const total = col.catTasks.length
              const isAllCompleted = total > 0 && completedCount === total
              const progress = total > 0 ? (completedCount / total) * 100 : 0
              return (
                <Card
                  key={col.category?.id || 'general'}
                  className={cn(
                    'shadow-[0_8px_32px_rgba(0,0,0,0.4)] border-white/5 bg-[#0a0a0a]/80 backdrop-blur-2xl rounded-2xl overflow-hidden flex flex-col transition-all duration-500 h-[calc(100vh-360px)] min-h-[400px] max-h-[700px]',
                    isAllCompleted &&
                      total > 0 &&
                      'border-primary/40 shadow-[0_8px_40px_rgba(128,0,32,0.15)] bg-gradient-to-b from-primary/[0.03] to-[#0a0a0a]/80',
                  )}
                >
                  <CardHeader className="p-6 border-b border-white/5 bg-white/[0.01]">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <CheckCircle2
                            className={cn(
                              'h-5 w-5 transition-colors duration-500',
                              isAllCompleted && total > 0
                                ? 'text-primary drop-shadow-[0_0_8px_rgba(128,0,32,0.8)]'
                                : 'text-white/20',
                            )}
                          />
                          <CardTitle className="text-xl font-bold font-display uppercase tracking-widest text-foreground">
                            {col.category ? col.category.name : 'Geral'}
                          </CardTitle>
                        </div>
                        {col.category && (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 border border-white/5 text-[11px] font-semibold text-white/50 ml-8 tracking-wider">
                            {formatTimeRange(col.category.start_time, col.category.end_time)}
                          </div>
                        )}
                      </div>
                      <div
                        className={cn(
                          'flex items-center justify-center h-11 w-11 rounded-full text-xs font-bold transition-all duration-500 shrink-0',
                          total > 0 && isAllCompleted
                            ? 'bg-primary text-white shadow-[0_0_15px_rgba(128,0,32,0.5)] scale-105'
                            : 'bg-white/5 text-white/40 border border-white/10',
                        )}
                      >
                        <span className="flex flex-col items-center leading-[0.85]">
                          <span className="text-[13px]">{completedCount}/</span>
                          <span className="text-[10px] opacity-70">{total}</span>
                        </span>
                      </div>
                    </div>
                    {total > 0 && (
                      <Progress
                        value={progress}
                        className="h-1.5 mt-5 bg-white/5 [&>div]:bg-primary overflow-hidden rounded-full shadow-inner"
                      />
                    )}
                  </CardHeader>
                  <CardContent className="p-0 flex-1 flex flex-col overflow-hidden">
                    <ul className="flex-1 flex flex-col overflow-y-auto scrollbar-thin">
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
                      <div className="mt-auto border-t border-white/5">
                        <ShiftHandoverNotes categoryId={col.category.id} userId={user?.id} />
                      </div>
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
