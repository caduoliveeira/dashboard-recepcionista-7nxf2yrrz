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
import { YesterdayPerformance } from '@/components/yesterday-performance'

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
        <Skeleton className="h-10 w-64 bg-white/5" />
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 bg-white/5" />
          ))}
        </div>
        <Skeleton className="h-64 bg-white/5" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/10">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold tracking-[0.2em] uppercase mb-2 shadow-glow-sm">
            <Target className="h-3 w-3" />
            Performance Global
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground font-display">
            Dashboard de Pontualidade
          </h1>
          <p className="text-muted-foreground font-medium tracking-wide text-sm">
            Visão gerencial da performance e eficiência operacional da equipe.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground bg-card/60 backdrop-blur-xl px-4 py-2.5 rounded-xl border border-white/10 shadow-sm">
            <Clock className="h-4 w-4 text-primary drop-shadow-glow" />
            {new Date().toLocaleDateString('pt-BR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </div>
          <Button
            onClick={() => setSettingsOpen(true)}
            className="gap-2 h-10 px-6 rounded-xl shadow-glow bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-white font-semibold tracking-wider text-xs uppercase border border-primary/50"
          >
            <Target className="h-4 w-4" /> Ajustar Metas
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

      <YesterdayPerformance />

      <PerformanceGauge actualRate={stats.onTimeRate} targetRate={targetRate} />

      <DelayedTasksList stats={stats.frequentlyDelayed} />

      <GoalSettingsModal
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        currentTarget={targetRate}
        onSaved={setTargetRate}
      />

      <Card className="shadow-glass border-white/10 rounded-2xl overflow-hidden bg-card/60 backdrop-blur-xl">
        <CardHeader className="border-b border-white/5 bg-white/[0.02] pb-5 pt-6">
          <CardTitle className="font-display text-xl font-bold tracking-tight text-foreground">
            Resumo Operacional
          </CardTitle>
          <CardDescription className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">
            Progresso de hoje agrupado por período.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-8 space-y-6 bg-transparent">
          {['Opening', 'Shift', 'Closing'].map((cat) => {
            const catTasks = tasks.filter((t) => t.category === cat)
            if (catTasks.length === 0) return null
            const catCompleted = catTasks.filter((t) =>
              completions.some((c) => c.task_id === t.id),
            ).length
            const catProgress = Math.round((catCompleted / catTasks.length) * 100)
            return (
              <div key={cat} className="space-y-3 group">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-foreground tracking-wide">
                    {CATEGORY_LABELS[cat]}
                  </span>
                  <Badge
                    variant="outline"
                    className="text-xs font-bold px-3 py-1 bg-white/5 text-muted-foreground border-white/10 rounded-full shadow-sm"
                  >
                    {catCompleted} / {catTasks.length}
                  </Badge>
                </div>
                <Progress
                  value={catProgress}
                  className="h-2 bg-white/5 [&>div]:bg-gradient-to-r [&>div]:from-primary [&>div]:to-primary/80 transition-all group-hover:opacity-90 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]"
                />
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}
