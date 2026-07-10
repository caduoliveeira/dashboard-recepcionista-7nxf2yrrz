import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { AlertTriangle, Minus, ArrowDown } from 'lucide-react'

export function PriorityBadge({ priority }: { priority: string }) {
  const config: Record<string, { icon: typeof AlertTriangle; className: string; label: string }> = {
    High: {
      icon: AlertTriangle,
      className: 'bg-primary/5 text-primary border-primary/30',
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

  if (priority === 'Medium' || priority === 'Low') {
    return null // The screenshot only highlights High priority. Others remain hidden to keep UI clean.
  }

  const c = config[priority] || config.Medium
  const Icon = c.icon
  return (
    <Badge
      variant="outline"
      className={cn(
        'text-[10px] font-bold tracking-wide gap-1 px-2 py-0.5 rounded border uppercase',
        c.className,
      )}
    >
      <Icon className="h-3 w-3" strokeWidth={2} /> {c.label}
    </Badge>
  )
}
