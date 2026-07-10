import { useState, useRef, useEffect } from 'react'
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
  const [descExpanded, setDescExpanded] = useState(false)
  const [isOverflowing, setIsOverflowing] = useState(false)
  const descRef = useRef<HTMLParagraphElement>(null)
  const isCompleted = !!completion
  const overdue = isTaskOverdue(task.expected_time, isCompleted)
  const upcoming = isTaskUpcoming(task.expected_time, isCompleted)
  const completedLate =
    isCompleted && wasCompletedLate(completion!.completed_at, task.expected_time)

  useEffect(() => {
    if (descRef.current && task.description) {
      const el = descRef.current
      if (descExpanded) {
        setIsOverflowing(false)
      } else {
        setIsOverflowing(el.scrollHeight > el.clientHeight + 1)
      }
    }
  }, [task.description, descExpanded])

  return (
    <li
      className={cn(
        'p-6 border-b border-white/5 last:border-0 transition-all duration-500 group relative',
        !isCompleted
          ? 'hover:bg-white/[0.04] hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(128,0,32,0.1)] hover:border-primary/20 hover:z-10'
          : 'bg-black/20 opacity-80',
        !isCompleted && task.priority === 'High' && 'bg-primary/[0.02]',
      )}
    >
      <div className="flex gap-4">
        <button
          onClick={() => onComplete(task.id)}
          disabled={isCompleted}
          className={cn(
            'shrink-0 mt-0.5 transition-all duration-500 rounded-full flex items-center justify-center h-6 w-6 border',
            isCompleted
              ? 'border-primary bg-primary text-white shadow-[0_0_12px_rgba(128,0,32,0.6)] scale-110'
              : 'border-white/20 text-transparent hover:border-primary hover:shadow-[0_0_8px_rgba(128,0,32,0.4)]',
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
          <div className="flex flex-col gap-1.5">
            <span
              className={cn(
                'text-[15px] font-medium leading-snug break-words transition-colors duration-500',
                isCompleted
                  ? 'text-white/30 line-through decoration-white/20'
                  : 'text-white/90 group-hover:text-white',
              )}
            >
              {task.title}
            </span>
            <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
              <PriorityBadge priority={task.priority || 'Medium'} />
              {overdue && (
                <span className="text-[10px] font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20 flex items-center gap-1 uppercase">
                  <AlertTriangle className="h-3 w-3" /> Atrasada
                </span>
              )}
              {upcoming && (
                <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20 flex items-center gap-1 uppercase">
                  <Timer className="h-3 w-3" /> Próxima
                </span>
              )}
              {completedLate && (
                <span className="text-[10px] font-bold text-orange-400 bg-orange-400/10 px-2 py-0.5 rounded border border-orange-400/20 flex items-center gap-1 uppercase">
                  <Clock className="h-3 w-3" /> Atraso
                </span>
              )}
            </div>
          </div>

          {task.description && (
            <div className="mt-2">
              <p
                ref={descRef}
                className={cn(
                  'text-xs leading-relaxed transition-all duration-300',
                  isCompleted ? 'text-white/20' : 'text-white/50 group-hover:text-white/70',
                  !descExpanded && 'line-clamp-2',
                )}
              >
                {task.description}
              </p>
              {(isOverflowing || descExpanded) && (
                <button
                  onClick={() => setDescExpanded((v) => !v)}
                  className="mt-1 inline-flex items-center gap-0.5 text-[11px] font-semibold text-primary/70 hover:text-primary transition-colors duration-300"
                >
                  {descExpanded ? (
                    <>
                      Ver menos <ChevronUp className="h-3 w-3" />
                    </>
                  ) : (
                    <>
                      Saiba mais <ChevronDown className="h-3 w-3" />
                    </>
                  )}
                </button>
              )}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 mt-4 text-xs">
            {task.expected_time && (
              <span
                className={cn(
                  'flex items-center gap-1 px-2 py-1 rounded border font-medium transition-colors duration-500',
                  isCompleted
                    ? 'bg-transparent border-transparent text-primary/50'
                    : overdue
                      ? 'bg-red-500/10 border-red-500/20 text-red-400'
                      : 'bg-white/5 border-white/10 text-white/60 group-hover:border-white/20',
                )}
              >
                <Clock className="h-3 w-3" />
                {task.expected_time.slice(0, 5)}
              </span>
            )}

            {isCompleted && (
              <span className="flex items-center gap-1 px-2 py-1 rounded bg-primary/10 text-primary border border-primary/20 font-medium shadow-glow-sm">
                ✓{' '}
                {new Date(completion!.completed_at).toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            )}

            {task.is_recurring && !isCompleted && (
              <span className="flex items-center gap-1 px-2 py-1 rounded border border-white/10 bg-white/5 text-white/50 font-medium">
                <Repeat className="h-3 w-3" />
                {task.recurrence_type === 'daily' ? 'Diária' : 'Semanal'}
              </span>
            )}

            <div className="ml-auto flex items-center gap-2">
              {task.is_recurring && !isCompleted && (
                <button
                  onClick={() => setSkipOpen(true)}
                  className="flex items-center gap-1 px-2 py-1 rounded border border-amber-500/20 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-colors font-medium"
                >
                  <SkipForward className="h-3 w-3" /> Pular
                </button>
              )}
              {task.instruction_url && (
                <a
                  href={task.instruction_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-2 py-1 rounded border border-blue-500/20 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors font-medium"
                >
                  <FileText className="h-3 w-3" /> Manual
                </a>
              )}
              {canDelete && onDelete && (
                <button
                  onClick={() => setDeleteOpen(true)}
                  className="flex items-center gap-1 px-2 py-1 text-white/40 hover:text-white transition-colors"
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
