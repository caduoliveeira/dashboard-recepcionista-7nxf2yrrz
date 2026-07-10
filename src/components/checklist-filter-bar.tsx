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
            'px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 border',
            value === f.value
              ? 'bg-gradient-to-r from-primary to-primary/80 text-white shadow-glow border-primary/50'
              : 'bg-card/50 backdrop-blur-sm text-muted-foreground border-white/10 hover:bg-white/10 hover:text-foreground hover:border-white/20',
          )}
        >
          {f.label}
          <span
            className={cn(
              'text-xs px-1.5 py-0.5 rounded-full tabular-nums font-bold',
              value === f.value ? 'bg-black/20 text-white' : 'bg-black/40 text-muted-foreground',
            )}
          >
            {counts[f.value]}
          </span>
        </button>
      ))}
    </div>
  )
}
