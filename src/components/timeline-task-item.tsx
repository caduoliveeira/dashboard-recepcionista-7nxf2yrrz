import { useState } from 'react'
import {
  CheckCircle2,
  Clock,
  SkipForward,
  AlertTriangle,
  Timer,
  FileText,
  Repeat,
  Ban,
  Trash2,
  CalendarIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { Task, TaskCompletion } from '@/services/tasks'
import { isTaskOverdue, isTaskUpcoming, wasCompletedLate } from '@/lib/task-utils'
import { PriorityBadge } from '@/components/priority-badge'
import { SkipTaskDialog } from '@/components/skip-task-dialog'
import { DeleteTaskDialog } from '@/components/delete-task-dialog'

interface TimelineTaskItemProps {
  task: Task
  completion?: TaskCompletion
  isSkipped: boolean
  isLast: boolean
  onComplete: (taskId: string) => void
  canDelete?: boolean
  onDelete?: (taskId: string) => void
}

export function TimelineTaskItem({
  task,
  completion,
  isSkipped,
  isLast,
  onComplete,
  canDelete,
  onDelete,
}: TimelineTaskItemProps) {
  const [skipOpen, setSkipOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const isCompleted = !!completion
  const overdue = isTaskOverdue(task.expected_time, isCompleted)
  const upcoming = isTaskUpcoming(task.expected_time, isCompleted)
  const completedLate =
    isCompleted && wasCompletedLate(completion!.completed_at, task.expected_time)
  const time = task.expected_time ? task.expected_time.slice(0, 5) : null
  const showActions = !isCompleted && !isSkipped

  return (
    <>
      <div className="flex gap-3 sm:gap-5">
        <div className="w-[48px] sm:w-[56px] shrink-0 pt-4 text-right">
          <span
            className={cn(
              'text-xs sm:text-sm font-bold tabular-nums',
              isCompleted ? 'text-muted-foreground/60' : 'text-foreground',
            )}
          >
            {time || '—'}
          </span>
        </div>
        <div className="relative flex flex-col items-center shrink-0">
          <div
            className={cn(
              'w-4 h-4 rounded-full mt-5 border-2 transition-all duration-500 z-10 flex items-center justify-center',
              isCompleted
                ? 'bg-primary border-primary'
                : isSkipped
                  ? 'bg-amber-500 border-amber-500'
                  : overdue
                    ? 'bg-red-500/20 border-red-500'
                    : 'bg-card border-border',
            )}
          >
            {isCompleted && <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground" />}
            {isSkipped && !isCompleted && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
          </div>
          {!isLast && <div className="w-0.5 flex-1 bg-border mt-1 mb-4" />}
        </div>
        <Card
          className={cn(
            'flex-1 mb-4 transition-all duration-500 rounded-xl',
            isCompleted
              ? 'bg-muted/30 opacity-75 border-border'
              : isSkipped
                ? 'bg-amber-50/50 border-amber-200'
                : overdue
                  ? 'border-red-200 bg-red-50/30'
                  : 'bg-card border-border hover:shadow-md',
          )}
        >
          <div className="p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <h3
                className={cn(
                  'text-sm sm:text-base font-semibold leading-snug',
                  isCompleted ? 'text-muted-foreground line-through' : 'text-foreground',
                )}
              >
                {task.title}
              </h3>
              <PriorityBadge priority={task.priority || 'Medium'} />
            </div>
            {task.description && (
              <p
                className={cn(
                  'text-xs sm:text-sm mt-2 leading-relaxed whitespace-pre-wrap',
                  isCompleted ? 'text-muted-foreground/50' : 'text-muted-foreground',
                )}
              >
                {task.description}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-1.5 mt-3">
              {task.expected_time && (
                <span
                  className={cn(
                    'flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border uppercase tabular-nums',
                    isCompleted
                      ? 'bg-transparent border-transparent text-muted-foreground/50'
                      : overdue
                        ? 'bg-red-500/10 border-red-500/20 text-red-700'
                        : 'bg-muted/50 border-border text-muted-foreground',
                  )}
                >
                  <Clock className="h-3 w-3" /> {time}
                </span>
              )}
              {overdue && !isCompleted && !isSkipped && (
                <span className="text-[10px] font-bold text-red-700 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20 flex items-center gap-1 uppercase">
                  <AlertTriangle className="h-3 w-3" /> Atrasada
                </span>
              )}
              {upcoming && !isCompleted && !isSkipped && (
                <span className="text-[10px] font-bold text-amber-700 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 flex items-center gap-1 uppercase">
                  <Timer className="h-3 w-3" /> Próxima
                </span>
              )}
              {completedLate && (
                <span className="text-[10px] font-bold text-orange-700 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20 flex items-center gap-1 uppercase">
                  <Clock className="h-3 w-3" /> Atraso
                </span>
              )}
              {isSkipped && (
                <span className="text-[10px] font-bold text-amber-700 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 flex items-center gap-1 uppercase">
                  <Ban className="h-3 w-3" /> Pulada
                </span>
              )}
              {isCompleted && completion && (
                <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20 flex items-center gap-1 tabular-nums">
                  ✓{' '}
                  {new Date(completion.completed_at).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              )}
              {task.is_recurring && !isCompleted && (
                <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border border-border bg-muted/50 text-muted-foreground uppercase">
                  <Repeat className="h-3 w-3" />{' '}
                  {task.recurrence_type === 'daily' ? 'Diária' : 'Semanal'}
                </span>
              )}
              {task.scheduled_date && !isCompleted && (
                <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-500/20 bg-blue-500/10 text-blue-700 uppercase">
                  <CalendarIcon className="h-3 w-3" /> Hoje
                </span>
              )}
            </div>
            {showActions && (
              <div className="flex items-center gap-2 mt-4">
                <Button
                  size="sm"
                  onClick={() => onComplete(task.id)}
                  className="gap-1.5 h-8 text-xs"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" /> Concluir
                </Button>
                {task.is_recurring && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSkipOpen(true)}
                    className="gap-1.5 h-8 text-xs border-amber-500/30 text-amber-700 hover:bg-amber-50"
                  >
                    <SkipForward className="h-3.5 w-3.5" /> Pular
                  </Button>
                )}
                {task.instruction_url && (
                  <a href={task.instruction_url} target="_blank" rel="noopener noreferrer">
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 h-8 text-xs border-blue-500/30 text-blue-700 hover:bg-blue-50"
                    >
                      <FileText className="h-3.5 w-3.5" /> Manual
                    </Button>
                  </a>
                )}
                {canDelete && onDelete && (
                  <button
                    onClick={() => setDeleteOpen(true)}
                    className="ml-auto text-muted-foreground hover:text-destructive transition-colors p-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}
          </div>
        </Card>
      </div>
      <SkipTaskDialog task={task} open={skipOpen} onOpenChange={setSkipOpen} />
      {canDelete && onDelete && (
        <DeleteTaskDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          onConfirm={() => {
            setDeleteOpen(false)
            onDelete(task.id)
          }}
        />
      )}
    </>
  )
}
