import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  CheckCircle2,
  Circle,
  Clock,
  Repeat,
  AlertTriangle,
  Timer,
  SkipForward,
  FileText,
  Trash2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Task, TaskCompletion } from '@/services/tasks'
import { isTaskOverdue, isTaskUpcoming, wasCompletedLate } from '@/lib/task-utils'
import { PriorityBadge } from '@/components/priority-badge'
import { SkipTaskDialog } from '@/components/skip-task-dialog'
import { DeleteTaskDialog } from '@/components/delete-task-dialog'

interface ChecklistTaskItemProps {
  task: Task
  completion?: TaskCompletion
  onComplete: (taskId: string) => void
  onDelete?: (taskId: string) => void
  canDelete?: boolean
}

export function ChecklistTaskItem({
  task,
  completion,
  onComplete,
  onDelete,
  canDelete,
}: ChecklistTaskItemProps) {
  const [skipOpen, setSkipOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const isCompleted = !!completion
  const overdue = isTaskOverdue(task.expected_time, isCompleted)
  const upcoming = isTaskUpcoming(task.expected_time, isCompleted)
  const completedLate =
    isCompleted && wasCompletedLate(completion!.completed_at, task.expected_time)

  return (
    <li
      className={cn(
        'p-4 transition-all duration-300',
        isCompleted ? 'bg-black/20' : overdue ? 'bg-destructive/10' : 'hover:bg-white/5',
        !isCompleted &&
          task.priority === 'High' &&
          'border-l-2 border-l-red-500 shadow-[inset_4px_0_10px_rgba(239,68,68,0.1)]',
      )}
    >
      <div className="flex items-start gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onComplete(task.id)}
          disabled={isCompleted}
          className={cn(
            'h-8 w-8 mt-0.5 shrink-0 transition-all rounded-full border border-transparent',
            isCompleted
              ? 'text-primary opacity-100 shadow-glow-sm'
              : 'text-muted-foreground hover:text-primary hover:bg-primary/10 hover:border-primary/30',
          )}
        >
          {isCompleted ? (
            <CheckCircle2 className="h-7 w-7 drop-shadow-[0_0_8px_rgba(128,0,32,0.6)]" />
          ) : (
            <Circle className="h-7 w-7 stroke-[1.5]" />
          )}
        </Button>
        <div className="space-y-1.5 flex-1 pt-1">
          <div className="flex items-start justify-between gap-2">
            <p
              className={cn(
                'font-medium text-[15px] leading-tight transition-all',
                isCompleted
                  ? 'text-muted-foreground line-through decoration-muted-foreground/30'
                  : 'text-foreground',
              )}
            >
              {task.title}
            </p>
            <div className="flex flex-wrap gap-1 shrink-0">
              {task.instruction_url && (
                <a
                  href={task.instruction_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] font-semibold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20 flex items-center gap-1 hover:bg-blue-500/20 transition-colors"
                >
                  <FileText className="h-3 w-3" /> Manual
                </a>
              )}
              <PriorityBadge priority={task.priority || 'Medium'} />
              {overdue && (
                <span className="text-[10px] font-semibold text-destructive bg-destructive/10 px-2 py-0.5 rounded-full border border-destructive/20 flex items-center gap-1 shadow-[0_0_10px_rgba(239,68,68,0.2)]">
                  <AlertTriangle className="h-3 w-3" /> Atrasada
                </span>
              )}
              {upcoming && (
                <span className="text-[10px] font-semibold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20 flex items-center gap-1">
                  <Timer className="h-3 w-3" /> Proxima
                </span>
              )}
              {completedLate && (
                <span className="text-[10px] font-semibold text-orange-400 bg-orange-400/10 px-2 py-0.5 rounded-full border border-orange-400/20 flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Atraso
                </span>
              )}
            </div>
          </div>
          {task.description && (
            <p
              className={cn(
                'text-sm transition-all',
                isCompleted ? 'text-muted-foreground/40' : 'text-muted-foreground/80',
              )}
            >
              {task.description}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {task.expected_time && (
              <div
                className={cn(
                  'flex items-center text-[11px] font-medium px-1.5 py-0.5 rounded border transition-all',
                  isCompleted
                    ? 'text-muted-foreground/50 bg-white/5 border-white/10'
                    : overdue
                      ? 'text-destructive bg-destructive/10 border-destructive/20'
                      : 'text-primary/90 bg-primary/10 border-primary/20',
                )}
              >
                <Clock className="h-3 w-3 mr-1" />
                {task.expected_time.slice(0, 5)}
              </div>
            )}
            {task.is_recurring && !isCompleted && (
              <div className="flex items-center gap-1 text-[11px] font-medium text-primary/80 bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                <Repeat className="h-3 w-3" />
                {task.recurrence_type === 'daily' ? 'Diaria' : 'Semanal'}
              </div>
            )}
            {isCompleted && (
              <div className="flex items-center gap-1.5 text-[11px] text-primary/80 font-medium bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20 shadow-glow-sm">
                ✓{' '}
                {new Date(completion!.completed_at).toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            )}
            {task.is_recurring && !isCompleted && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSkipOpen(true)}
                className="h-6 px-2 text-[11px] text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10 gap-1 transition-all"
              >
                <SkipForward className="h-3 w-3" /> Pular
              </Button>
            )}
            {canDelete && onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDeleteOpen(true)}
                className="h-6 px-2 text-[11px] text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-1 ml-auto transition-all"
              >
                <Trash2 className="h-3 w-3" /> Excluir
              </Button>
            )}
          </div>
        </div>
      </div>
      <SkipTaskDialog task={task} open={skipOpen} onOpenChange={setSkipOpen} />
      <DeleteTaskDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={() => {
          setDeleteOpen(false)
          onDelete(task.id)
        }}
      />
    </li>
  )
}
