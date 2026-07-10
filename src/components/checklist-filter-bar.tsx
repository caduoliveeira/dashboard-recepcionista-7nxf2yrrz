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
            'px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-300 flex items-center gap-3 border',
            value === f.value
              ? 'bg-primary text-white shadow-glow-sm border-transparent'
              : 'bg-transparent text-white/60 border-white/10 hover:bg-white/5 hover:text-white',
          )}
        >
          {f.label}
          <span
            className={cn(
              'text-xs px-2 py-0.5 rounded-full tabular-nums font-bold leading-none',
              value === f.value ? 'bg-black/20 text-white' : 'bg-white/10 text-white/50',
            )}
          >
            {counts[f.value]}
          </span>
        </button>
      ))}
    </div>
  )
}
