import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertTriangle, BellRing, Clock, CheckCircle2, Wrench } from 'lucide-react'
import { cn } from '@/lib/utils'

type Ticket = {
  id: string
  description: string
  status: string
  created_at: string
  profiles?: { full_name: string | null } | null
}

const STATUS_STYLES: Record<string, { label: string; className: string; icon: typeof Clock }> = {
  Pending: {
    label: 'Pendente',
    className: 'bg-red-50 text-red-700 border-red-300',
    icon: AlertTriangle,
  },
  'In Progress': {
    label: 'Em Andamento',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: Clock,
  },
  Resolved: {
    label: 'Resolvido',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: CheckCircle2,
  },
}

export function MaintenanceAlertPanel() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [hasNewAlert, setHasNewAlert] = useState(false)

  useEffect(() => {
    const loadTickets = async () => {
      const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      const { data } = await supabase
        .from('maintenance_tickets')
        .select(`
          id, description, status, created_at,
          profiles ( full_name )
        `)
        .gte('created_at', cutoff)
        .order('created_at', { ascending: false })

      const formatted = (data || []).map((item: any) => ({
        ...item,
        profiles: Array.isArray(item.profiles) ? item.profiles[0] : item.profiles,
      })) as Ticket[]

      setTickets(formatted)
      setLoading(false)
    }

    loadTickets()

    const channel = supabase
      .channel('maintenance_alerts_realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'maintenance_tickets' },
        () => {
          setHasNewAlert(true)
          loadTickets()
        },
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'maintenance_tickets' },
        () => loadTickets(),
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const pendingCount = tickets.filter(
    (t) => t.status === 'Pending' || t.status === 'In Progress',
  ).length

  return (
    <Card className={cn('shadow-sm', pendingCount > 0 && 'border-red-300')}>
      <CardHeader
        className={cn('border-b pb-4', pendingCount > 0 ? 'bg-red-50/60' : 'bg-muted/10')}
      >
        <CardTitle className="text-base flex items-center gap-2">
          {hasNewAlert ? (
            <BellRing className="h-4 w-4 text-red-600 animate-pulse" />
          ) : (
            <Wrench className="h-4 w-4 text-muted-foreground" />
          )}
          Alertas de Manutenção
          {pendingCount > 0 && (
            <Badge
              variant="outline"
              className="bg-red-100 text-red-700 border-red-300 gap-1 animate-pulse"
            >
              <AlertTriangle className="h-3 w-3" /> {pendingCount} requer atenção
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Tickets criados nas últimas 24 horas — atualização em tempo real
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="p-4 space-y-2">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        ) : tickets.length === 0 ? (
          <p className="py-12 text-center text-muted-foreground text-sm">
            Nenhum ticket de manutenção nas últimas 24 horas.
          </p>
        ) : (
          <ul className="divide-y max-h-[320px] overflow-y-auto">
            {tickets.map((ticket) => {
              const sc = STATUS_STYLES[ticket.status] || STATUS_STYLES.Pending
              const Icon = sc.icon
              const isPending = ticket.status === 'Pending'
              return (
                <li
                  key={ticket.id}
                  className={cn(
                    'px-4 py-3 flex items-center gap-3 transition-colors',
                    isPending ? 'bg-red-50/50 border-l-4 border-l-red-500' : 'hover:bg-muted/30',
                  )}
                >
                  <div className={cn('p-1.5 rounded-lg shrink-0', sc.className)}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn('text-sm text-foreground', isPending && 'font-semibold')}>
                      {ticket.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {ticket.profiles?.full_name || 'Usuário'} ·{' '}
                      {new Date(ticket.created_at).toLocaleString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <Badge variant="outline" className={cn('shrink-0 text-xs', sc.className)}>
                    {sc.label}
                  </Badge>
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
