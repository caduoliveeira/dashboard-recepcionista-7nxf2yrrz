import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { AlertTriangle, Minus, ArrowDown } from 'lucide-react'

export function PriorityBadge({ priority }: { priority: string }) {
  const config: Record<string, { icon: typeof AlertTriangle; className: string; label: string }> = {
    High: {
      icon: AlertTriangle,
      className: 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-glow-sm',
      label: 'ALTA PRIORIDADE',
    },
    Medium: {
      icon: Minus,
      className: 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-sm',
      label: 'MÉDIA',
    },
    Low: {
      icon: ArrowDown,
      className: 'bg-white/5 text-white/50 border-white/10 shadow-sm',
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
