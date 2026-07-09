import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { AlertTriangle, Minus, ArrowDown } from 'lucide-react'

export function PriorityBadge({ priority }: { priority: string }) {
  const config: Record<string, { icon: typeof AlertTriangle; className: string; label: string }> = {
    High: {
      icon: AlertTriangle,
      className: 'bg-red-50 text-red-700 border-red-200',
      label: 'Alta',
    },
    Medium: {
      icon: Minus,
      className: 'bg-amber-50 text-amber-700 border-amber-200',
      label: 'Media',
    },
    Low: {
      icon: ArrowDown,
      className: 'bg-slate-50 text-slate-600 border-slate-200',
      label: 'Baixa',
    },
  }
  const c = config[priority] || config.Medium
  const Icon = c.icon
  return (
    <Badge
      variant="outline"
      className={cn('text-[10px] font-semibold gap-1 px-2 py-0.5', c.className)}
    >
      <Icon className="h-3 w-3" /> {c.label}
    </Badge>
  )
}
