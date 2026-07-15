import { useMemo } from 'react'
import { Sunrise, Sun, Sunset, Clock } from 'lucide-react'
import { TimelineTaskItem } from '@/components/timeline-task-item'
import type { Task, TaskCompletion } from '@/services/tasks'
import { shouldShowTaskToday } from '@/lib/task-utils'

interface TimelineViewProps {
  tasks: Task[]
  completions: TaskCompletion[]
  skippedIds: Set<string>
  onComplete: (taskId: string) => void
  canDelete?: boolean
  onDelete?: (taskId: string) => void
}

const PERIODS = [
  { key: 'morning', label: 'Manhã', range: '05:00 — 11:59', icon: Sunrise, min: 300, max: 719 },
  { key: 'afternoon', label: 'Tarde', range: '12:00 — 17:59', icon: Sun, min: 720, max: 1079 },
  { key: 'evening', label: 'Noite', range: '18:00 — 23:00', icon: Sunset, min: 1080, max: 1380 },
] as const

const timeToMinutes = (t: string) => parseInt(t.slice(0, 2)) * 60 + parseInt(t.slice(3, 5))

export function TimelineView({
  tasks,
  completions,
  skippedIds,
  onComplete,
  canDelete,
  onDelete,
}: TimelineViewProps) {
  const { scheduled, anytime } = useMemo(() => {
    const valid = tasks.filter((t) => shouldShowTaskToday(t.recurrence_days, t.scheduled_date))
    const withTime = valid
      .filter((t) => t.expected_time)
      .sort((a, b) => timeToMinutes(a.expected_time!) - timeToMinutes(b.expected_time!))
    const withoutTime = valid.filter((t) => !t.expected_time)
    return { scheduled: withTime, anytime: withoutTime }
  }, [tasks])

  const getCompletion = (taskId: string) => completions.find((c) => c.task_id === taskId)

  const renderPeriod = (period: (typeof PERIODS)[number]) => {
    const periodTasks = scheduled.filter((t) => {
      const min = timeToMinutes(t.expected_time!)
      return min >= period.min && min <= period.max
    })
    if (periodTasks.length === 0) return null
    return (
      <div key={period.key} className="mb-6">
        <div className="flex items-center gap-2 mb-4 ml-[64px] sm:ml-[76px]">
          <period.icon className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-bold uppercase tracking-widest text-foreground">
            {period.label}
          </span>
          <span className="text-xs text-muted-foreground tabular-nums">{period.range}</span>
        </div>
        {periodTasks.map((task, i) => (
          <TimelineTaskItem
            key={task.id}
            task={task}
            completion={getCompletion(task.id)}
            isSkipped={skippedIds.has(task.id)}
            isLast={i === periodTasks.length - 1}
            onComplete={onComplete}
            canDelete={canDelete}
            onDelete={onDelete}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {PERIODS.map(renderPeriod)}
      {anytime.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4 ml-[64px] sm:ml-[76px]">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-bold uppercase tracking-widest text-foreground">
              Sem Horário
            </span>
            <span className="text-xs text-muted-foreground">A qualquer hora</span>
          </div>
          {anytime.map((task, i) => (
            <TimelineTaskItem
              key={task.id}
              task={task}
              completion={getCompletion(task.id)}
              isSkipped={skippedIds.has(task.id)}
              isLast={i === anytime.length - 1}
              onComplete={onComplete}
              canDelete={canDelete}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
      {scheduled.length === 0 && anytime.length === 0 && (
        <div className="text-center py-12 text-muted-foreground font-medium">
          Nenhuma tarefa encontrada para este filtro.
        </div>
      )}
    </div>
  )
}
