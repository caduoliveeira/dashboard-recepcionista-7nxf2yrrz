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

import { AlertTriangle } from 'lucide-react'

const CATEGORY_ORDER = ['DIÁRIA', 'MANHÃ', 'TARDE', 'NOITE']

const getCategoryOrderIndex = (name: string) => {
  const upper = name.toUpperCase()
  const idx = CATEGORY_ORDER.findIndex((c) => upper.includes(c))
  return idx === -1 ? CATEGORY_ORDER.length : idx
}

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
    setError(false)
    try {
      const [tasksRes, catsRes, completionsRes, activityRes] = await Promise.all([
        fetchTasks(),
        fetchTaskCategories(),
        fetchTodayCompletions(),
        fetchTodayActivity(),
      ])

      if (tasksRes.error || catsRes.error || completionsRes.error || activityRes.error) {
        setError(true)
      } else {
        setTasks(tasksRes.data ?? [])
        setCategories(catsRes.data ?? [])
        setCompletions(completionsRes.data ?? [])
        setActivity(activityRes.data ?? [])
      }
    } catch (err) {
      console.error(err)
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

  const completedIds = useMemo(
    () => new Set((completions || []).map((c) => c.task_id)),
    [completions],
  )

  const filterCounts = useMemo(() => {
    const counts: Record<FilterType, number> = { all: 0, now: 0, upcoming: 0, completed: 0 }
    ;(tasks || []).forEach((t) => {
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
      (tasks || []).filter(
        (t) =>
          shouldShowTask(t.expected_time, completedIds.has(t.id), filter) &&
          shouldShowTaskToday(t.recurrence_days),
      ),
    [tasks, completedIds, filter],
  )

  const columns = useMemo(() => {
    try {
      const predefinedCols = CATEGORY_ORDER.map((name) => {
        const cat = (categories || []).find((c) => c.name.toUpperCase().includes(name))
        const catTasks = filteredTasks.filter((t) => {
          if (cat) return t.category_id === cat.id
          return t.category?.toUpperCase().includes(name)
        })
        return {
          name,
          category:
            cat ||
            ({ id: `dummy-${name}`, name, start_time: null, end_time: null } as TaskCategory),
          catTasks,
        }
      })

      const otherCats = (categories || []).filter(
        (c) => !CATEGORY_ORDER.some((name) => c.name.toUpperCase().includes(name)),
      )
      const others = otherCats.map((cat) => ({
        name: cat.name,
        category: cat,
        catTasks: filteredTasks.filter((t) => t.category_id === cat.id),
      }))

      const uncategorized = filteredTasks.filter((t) => {
        if (t.category_id) return false
        return !CATEGORY_ORDER.some((name) => t.category?.toUpperCase().includes(name))
      })

      const allCols = [...predefinedCols, ...others]
      if (uncategorized.length > 0) {
        allCols.push({
          name: 'GERAL',
          category: null as unknown as TaskCategory,
          catTasks: uncategorized,
        })
      }

      return allCols
    } catch (err) {
      console.error('Error computing columns:', err)
      return []
    }
  }, [categories, filteredTasks])

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64 mb-2 bg-muted" />
        <Skeleton className="h-12 w-full bg-muted" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-[400px] rounded-2xl bg-muted" />
          <Skeleton className="h-[400px] rounded-2xl bg-muted" />
          <Skeleton className="h-[400px] rounded-2xl bg-muted" />
          <Skeleton className="h-[400px] rounded-2xl bg-muted" />
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
        <p className="text-muted-foreground max-w-md text-sm leading-relaxed">
          Não foi possível carregar os dados do servidor. Por favor, verifique sua conexão ou tente
          novamente.
        </p>
        <Button onClick={loadData} variant="outline" className="mt-4 gap-2 border-border">
          Tentar Novamente
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 relative">
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10 pointer-events-none opacity-50" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-secondary/30 rounded-full blur-[100px] -z-10 pointer-events-none opacity-50" />

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-border">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-[10px] font-extrabold tracking-widest uppercase mb-1 shadow-sm">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Operação Diária
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground font-display">
            Checklist de Rotina
          </h1>
          <p className="text-muted-foreground font-medium tracking-wide text-sm">
            Gestão e acompanhamento das tarefas e processos do clube.
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

      {filteredTasks.length === 0 ? (
        <div className="space-y-8">
          <Card className="border-dashed border-border bg-card/50 backdrop-blur-sm">
            <CardContent className="py-12 text-center text-muted-foreground font-medium">
              Nenhuma tarefa encontrada para este filtro.
            </CardContent>
          </Card>
          <ActivityFeed items={activity} />
        </div>
      ) : (
        <div className="flex flex-col gap-10">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-start">
            {(columns || []).map((col) => {
              const completedCount = (col.catTasks || []).filter((t) =>
                completedIds.has(t.id),
              ).length
              const total = (col.catTasks || []).length
              const isAllCompleted = total > 0 && completedCount === total
              const progress = total > 0 ? (completedCount / total) * 100 : 0
              return (
                <Card
                  key={col.category?.id || col.name}
                  className={cn(
                    'shadow-md border-border bg-card/95 backdrop-blur-2xl rounded-2xl flex flex-col transition-all duration-500 h-[calc(100vh-300px)] min-h-[400px]',
                    isAllCompleted &&
                      total > 0 &&
                      'border-primary/40 shadow-lg bg-gradient-to-b from-primary/5 to-card/95',
                  )}
                >
                  <CardHeader className="p-5 border-b border-border bg-muted/20 shrink-0">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <CheckCircle2
                            className={cn(
                              'h-5 w-5 transition-colors duration-500',
                              isAllCompleted && total > 0
                                ? 'text-primary drop-shadow-sm'
                                : 'text-muted-foreground/50',
                            )}
                          />
                          <CardTitle className="text-lg font-bold font-display uppercase tracking-widest text-foreground">
                            {col.name}
                          </CardTitle>
                        </div>
                        {col.category?.start_time && col.category?.end_time && (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-muted border border-border text-[10px] font-bold text-muted-foreground ml-7 tracking-wider">
                            {formatTimeRange(col.category.start_time, col.category.end_time)}
                          </div>
                        )}
                      </div>
                      <div
                        className={cn(
                          'flex items-center justify-center h-11 w-11 rounded-full text-xs font-bold transition-all duration-500 shrink-0',
                          total > 0 && isAllCompleted
                            ? 'bg-primary text-primary-foreground shadow-md scale-105'
                            : 'bg-muted text-muted-foreground border border-border',
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
                        className="h-1.5 mt-5 bg-muted [&>div]:bg-primary overflow-hidden rounded-full shadow-inner"
                      />
                    )}
                  </CardHeader>
                  <CardContent className="p-0 flex-1 flex flex-col overflow-hidden relative rounded-b-2xl">
                    <div className="flex-1 overflow-y-auto scrollbar-thin absolute inset-0 w-full">
                      {col.catTasks.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full p-6 text-center text-muted-foreground font-medium text-sm">
                          <p>Nenhuma tarefa agendada.</p>
                        </div>
                      ) : (
                        <ul className="flex flex-col pb-16">
                          {(col.catTasks || []).map((task) => (
                            <ChecklistTaskItem
                              key={task.id}
                              task={task}
                              completion={(completions || []).find((c) => c.task_id === task.id)}
                              onComplete={handleComplete}
                              onDelete={handleDelete}
                              canDelete={role === 'owner'}
                            />
                          ))}
                        </ul>
                      )}
                    </div>
                    {col.category && col.category.id && !col.category.id.startsWith('dummy-') && (
                      <div className="absolute bottom-0 left-0 right-0 border-t border-border bg-card/95 backdrop-blur-md">
                        <ShiftHandoverNotes categoryId={col.category.id} userId={user?.id} />
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <div className="w-full mt-4">
            <ActivityFeed items={activity} />
          </div>
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
