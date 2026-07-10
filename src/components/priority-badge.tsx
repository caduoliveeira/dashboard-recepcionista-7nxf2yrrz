import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { AlertTriangle, Minus, ArrowDown } from 'lucide-react'

export function PriorityBadge({ priority }: { priority: string }) {
  const config: Record<string, { icon: typeof AlertTriangle; className: string; label: string }> = {
    High: {
      icon: AlertTriangle,
      className:
        'bg-red-500/10 text-red-500 border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.2)] font-black',
      label: 'ALTA PRIORIDADE',
    },
    Medium: {
      icon: Minus,
      className: 'bg-white/5 text-white/60 border-white/10',
      label: 'MÉDIA',
    },
    Low: {
      icon: ArrowDown,
      className: 'bg-white/5 text-white/40 border-white/5',
      label: 'BAIXA',
    },
  }

  const c = config[priority] || config.Medium
  const Icon = c.icon
  return (
    <Badge
      variant="outline"
      className={cn(
        'text-[9px] font-extrabold tracking-widest gap-1 px-2 py-0.5 rounded-full border uppercase transition-colors inline-flex items-center shrink-0',
        c.className,
      )}
    >
      <Icon className="h-3 w-3 shrink-0" strokeWidth={2.5} /> {c.label}
    </Badge>
  )
}
