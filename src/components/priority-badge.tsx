import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { AlertTriangle, Minus, ArrowDown } from 'lucide-react'

export function PriorityBadge({ priority }: { priority: string }) {
  const config: Record<string, { icon: typeof AlertTriangle; className: string; label: string }> = {
    High: {
      icon: AlertTriangle,
      className: 'bg-rose-50 text-rose-700 border-rose-200/60 shadow-sm',
      label: 'ALTA PRIORIDADE',
    },
    Medium: {
      icon: Minus,
      className: 'bg-amber-50 text-amber-700 border-amber-200/60 shadow-sm',
      label: 'MÉDIA',
    },
    Low: {
      icon: ArrowDown,
      className: 'bg-slate-50 text-slate-600 border-slate-200/60 shadow-sm',
      label: 'BAIXA',
    },
  }
  const c = config[priority] || config.Medium
  const Icon = c.icon
  return (
    <Badge
      variant="outline"
      className={cn(
        'text-[9px] font-bold tracking-widest gap-1.5 px-2.5 py-1 rounded-md uppercase',
        c.className,
      )}
    >
      <Icon className="h-3 w-3" strokeWidth={2.5} /> {c.label}
    </Badge>
  )
}
