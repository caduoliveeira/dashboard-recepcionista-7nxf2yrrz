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
    <div className="flex flex-wrap gap-3">
      {FILTERS.map((f) => (
        <button
          key={f.value}
          onClick={() => onChange(f.value)}
          className={cn(
            'px-6 py-2.5 rounded-full text-sm font-bold tracking-wide transition-all duration-300 flex items-center gap-3 border',
            value === f.value
              ? 'bg-primary text-white shadow-[0_4px_20px_rgba(128,0,32,0.4)] border-primary'
              : 'bg-white/[0.02] text-white/60 border-white/10 hover:bg-white/5 hover:text-white hover:border-white/20',
          )}
        >
          {f.label}
          <span
            className={cn(
              'text-xs px-2.5 py-0.5 rounded-full tabular-nums font-extrabold leading-none',
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
