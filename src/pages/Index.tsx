import { useState, useEffect, useMemo } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import {
  fetchTasks,
  fetchTodayCompletions,
  fetchRecentCompletions,
  type Task,
  type TaskCompletion,
  type CompletionWithTask,
} from '@/services/tasks'
import { wasCompletedLate, isTaskOverdue } from '@/lib/task-utils'
import { PunctualityCards } from '@/components/punctuality-cards'
import { DelayedTasksList } from '@/components/delayed-tasks-list'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Clock, Target } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { fetchGymSettings } from '@/services/settings'
import { PerformanceGauge } from '@/components/performance-gauge'
import { GoalSettingsModal } from '@/components/goal-settings-modal'

const CATEGORY_LABELS: Record<string, string> = {
  Opening: 'Abertura',
  Shift: 'Turno',
  Closing: 'Fechamento',
}

export default function Index() {
  const { role } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [completions, setCompletions] = useState<TaskCompletion[]>([])
  const [recentCompletions, setRecentCompletions] = useState<CompletionWithTask[]>([])
  const [loading, setLoading] = useState(true)
  const [targetRate, setTargetRate] = useState(90)
  const [settingsOpen, setSettingsOpen] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const [t, c, r, s] = await Promise.all([
      fetchTasks(),
      fetchTodayCompletions(),
      fetchRecentCompletions(7),
      fetchGymSettings(),
    ])
    if (t.data) setTasks(t.data)
    if (c.data) setCompletions(c.data)
    if (r.data) setRecentCompletions(r.data)
    if (s.data) setTargetRate(s.data.target_completion_rate)
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
        <Skeleton className="h-64" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Dashboard de Pontualidade
          </h1>
          <p className="text-muted-foreground mt-1">
            Visão geral da performance e pontualidade da equipe.
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
          <Button variant="outline" onClick={() => setSettingsOpen(true)} className="gap-2">
            <Target className="h-4 w-4" /> Meta
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

      <PerformanceGauge actualRate={stats.onTimeRate} targetRate={targetRate} />

      <DelayedTasksList stats={stats.frequentlyDelayed} />

      <GoalSettingsModal
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        currentTarget={targetRate}
        onSaved={setTargetRate}
      />

      <Card className="shadow-sm border-border/60">
        <CardHeader className="border-b bg-muted/10 pb-4">
          <CardTitle>Resumo por Categoria</CardTitle>
          <CardDescription>Progresso de hoje agrupado por período.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          {['Opening', 'Shift', 'Closing'].map((cat) => {
            const catTasks = tasks.filter((t) => t.category === cat)
            if (catTasks.length === 0) return null
            const catCompleted = catTasks.filter((t) =>
              completions.some((c) => c.task_id === t.id),
            ).length
            const catProgress = Math.round((catCompleted / catTasks.length) * 100)
            return (
              <div key={cat} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{CATEGORY_LABELS[cat]}</span>
                  <Badge variant="secondary" className="text-xs">
                    {catCompleted}/{catTasks.length}
                  </Badge>
                </div>
                <Progress value={catProgress} className="h-2" />
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}
