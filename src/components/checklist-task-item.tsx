import { useState } from 'react'
import {
  CheckCircle2,
  Clock,
  Repeat,
  AlertTriangle,
  Timer,
  SkipForward,
  FileText,
  Trash2,
  ChevronDown,
  ChevronUp,
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
  const [isExpanded, setIsExpanded] = useState(false)

  const isCompleted = !!completion
  const overdue = isTaskOverdue(task.expected_time, isCompleted)
  const upcoming = isTaskUpcoming(task.expected_time, isCompleted)
  const completedLate =
    isCompleted && wasCompletedLate(completion!.completed_at, task.expected_time)

  const isLongDescription = task.description && task.description.length > 100

  return (
    <li
      className={cn(
        'p-5 border-b border-border last:border-0 transition-all duration-500 group relative',
        !isCompleted ? 'hover:bg-muted/50' : 'bg-muted/30 opacity-80',
        !isCompleted && task.priority === 'High' && 'bg-red-500/[0.03]',
      )}
    >
      <div className="flex gap-3">
        <button
          onClick={() => onComplete(task.id)}
          disabled={isCompleted}
          className={cn(
            'shrink-0 mt-0.5 transition-all duration-500 rounded-full flex items-center justify-center h-6 w-6 border',
            isCompleted
              ? 'border-primary bg-primary text-primary-foreground shadow-md scale-110'
              : 'border-border text-transparent hover:border-primary hover:shadow-sm',
          )}
        >
          <CheckCircle2
            className={cn(
              'h-6 w-6 transition-transform duration-500',
              isCompleted ? 'scale-100' : 'scale-0',
            )}
          />
        </button>

        <div className="flex-1 min-w-0 flex flex-col">
          <span
            className={cn(
              'text-[14px] font-medium leading-snug break-words transition-colors duration-500',
              isCompleted
                ? 'text-muted-foreground line-through decoration-muted-foreground/30'
                : 'text-foreground group-hover:text-foreground',
            )}
          >
            {task.title}
          </span>

          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
            <PriorityBadge priority={task.priority || 'Medium'} />
            {overdue && (
              <span className="text-[10px] font-bold text-red-700 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20 flex items-center gap-1 uppercase">
                <AlertTriangle className="h-3 w-3" /> Atrasada
              </span>
            )}
            {upcoming && (
              <span className="text-[10px] font-bold text-amber-700 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 flex items-center gap-1 uppercase">
                <Timer className="h-3 w-3" /> Próxima
              </span>
            )}
            {completedLate && (
              <span className="text-[10px] font-bold text-orange-700 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20 flex items-center gap-1 uppercase">
                <Clock className="h-3 w-3" /> Atraso
              </span>
            )}
          </div>

          {task.description && (
            <div className="mt-2 flex flex-col items-start gap-1">
              <p
                className={cn(
                  'text-xs leading-relaxed transition-all duration-300',
                  !isExpanded && 'line-clamp-2',
                  isCompleted
                    ? 'text-muted-foreground/50'
                    : 'text-muted-foreground group-hover:text-muted-foreground',
                )}
              >
                {task.description}
              </p>
              {isLongDescription && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-[10px] font-bold text-primary flex items-center gap-0.5 hover:text-primary-hover transition-colors"
                >
                  {isExpanded ? (
                    <>
                      Ver menos <ChevronUp className="h-3 w-3" />
                    </>
                  ) : (
                    <>
                      Ver mais <ChevronDown className="h-3 w-3" />
                    </>
                  )}
                </button>
              )}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 mt-3 text-xs">
            {task.expected_time && (
              <span
                className={cn(
                  'flex items-center gap-1 px-2 py-1 rounded border font-medium transition-colors duration-500',
                  isCompleted
                    ? 'bg-transparent border-transparent text-muted-foreground/50'
                    : overdue
                      ? 'bg-red-500/10 border-red-500/20 text-red-700'
                      : 'bg-muted/50 border-border text-muted-foreground group-hover:border-primary/30',
                )}
              >
                <Clock className="h-3 w-3" />
                {task.expected_time.slice(0, 5)}
              </span>
            )}

            {isCompleted && (
              <span className="flex items-center gap-1 px-2 py-1 rounded bg-primary/10 text-primary border border-primary/20 font-medium">
                ✓{' '}
                {new Date(completion!.completed_at).toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            )}

            {task.is_recurring && !isCompleted && (
              <span className="flex items-center gap-1 px-2 py-1 rounded border border-border bg-muted/50 text-muted-foreground font-medium">
                <Repeat className="h-3 w-3" />
                {task.recurrence_type === 'daily' ? 'Diária' : 'Semanal'}
              </span>
            )}

            <div className="ml-auto flex items-center gap-1.5">
              {task.is_recurring && !isCompleted && (
                <button
                  onClick={() => setSkipOpen(true)}
                  className="flex items-center gap-1 px-2 py-1 rounded border border-amber-500/20 bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 transition-colors font-medium"
                >
                  <SkipForward className="h-3 w-3" /> Pular
                </button>
              )}
              {task.instruction_url && (
                <a
                  href={task.instruction_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-2 py-1 rounded border border-blue-500/20 bg-blue-500/10 text-blue-700 hover:bg-blue-500/20 transition-colors font-medium"
                >
                  <FileText className="h-3 w-3" /> Manual
                </a>
              )}
              {canDelete && onDelete && (
                <button
                  onClick={() => setDeleteOpen(true)}
                  className="flex items-center gap-1 px-2 py-1 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Excluir
                </button>
              )}
            </div>
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
