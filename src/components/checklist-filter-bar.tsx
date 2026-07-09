import { cn } from '@/lib/utils'
import type { FilterType } from '@/lib/task-utils'

const FILTERS: { value: FilterType; label: string }[] = [
  { value: 'all', label: 'Tudo' },
  { value: 'now', label: 'Agora' },
  { value: 'upcoming', label: 'Próximas' },
  { value: 'completed', label: 'Concluídas' },
]

interface ChecklistFilterBarProps {
  value: FilterType
  onChange: (filter: FilterType) => void
  counts: Record<FilterType, number>
}

export function ChecklistFilterBar({ value, onChange, counts }: ChecklistFilterBarProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {FILTERS.map((f) => (
        <button
          key={f.value}
          onClick={() => onChange(f.value)}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2',
            value === f.value
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'bg-muted text-muted-foreground hover:bg-accent hover:text-foreground',
          )}
        >
          {f.label}
          <span
            className={cn(
              'text-xs px-1.5 py-0.5 rounded-full tabular-nums',
              value === f.value ? 'bg-primary-foreground/20' : 'bg-background',
            )}
          >
            {counts[f.value]}
          </span>
        </button>
      ))}
    </div>
  )
}
