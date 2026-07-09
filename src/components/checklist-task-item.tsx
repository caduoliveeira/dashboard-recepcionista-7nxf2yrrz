import { Button } from '@/components/ui/button'
import { CheckCircle2, Circle, Clock, Repeat } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Task, TaskCompletion } from '@/services/tasks'

interface ChecklistTaskItemProps {
  task: Task
  completion?: TaskCompletion
  onComplete: (taskId: string) => void
}

export function ChecklistTaskItem({ task, completion, onComplete }: ChecklistTaskItemProps) {
  const isCompleted = !!completion

  return (
    <li className={cn('p-4 transition-colors', isCompleted ? 'bg-card/50' : 'hover:bg-muted/30')}>
      <div className="flex items-start gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onComplete(task.id)}
          disabled={isCompleted}
          className={cn(
            'h-8 w-8 mt-0.5 shrink-0 transition-all rounded-full',
            isCompleted
              ? 'text-primary opacity-100'
              : 'text-muted-foreground hover:text-primary hover:bg-primary/10',
          )}
        >
          {isCompleted ? (
            <CheckCircle2 className="h-7 w-7" />
          ) : (
            <Circle className="h-7 w-7 stroke-[1.5]" />
          )}
        </Button>
        <div className="space-y-1.5 flex-1 pt-1">
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
          {task.description && (
            <p
              className={cn(
                'text-sm transition-all',
                isCompleted ? 'text-muted-foreground/60' : 'text-muted-foreground',
              )}
            >
              {task.description}
            </p>
          )}
          {task.expected_time && (
            <div
              className={cn(
                'flex items-center text-[11px] font-medium w-fit px-1.5 py-0.5 rounded border mt-2 transition-all',
                isCompleted
                  ? 'text-muted-foreground/50 bg-muted/20 border-border/50'
                  : 'text-primary/80 bg-primary/5 border-primary/10',
              )}
            >
              <Clock className="h-3 w-3 mr-1" />
              {task.expected_time.slice(0, 5)}
            </div>
          )}
          {task.is_recurring && !isCompleted && (
            <div className="flex items-center gap-1 text-[11px] font-medium text-primary/70 bg-primary/5 w-fit px-2 py-0.5 rounded-full border border-primary/10 mt-1">
              <Repeat className="h-3 w-3" />
              {task.recurrence_type === 'daily' ? 'Diária' : 'Semanal'}
            </div>
          )}
          {isCompleted && (
            <div className="flex items-center gap-1.5 text-[11px] text-primary/80 font-medium mt-2 bg-primary/5 w-fit px-2 py-0.5 rounded-full border border-primary/10">
              ✓ Concluído às{' '}
              {new Date(completion!.completed_at).toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          )}
        </div>
      </div>
    </li>
  )
}
