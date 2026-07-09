import { useState, useEffect } from 'react'
import {
  fetchTickets,
  createTicket,
  updateTicketStatus,
  type MaintenanceTicket,
} from '@/services/maintenance'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Wrench, Plus, CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

const STATUS_CONFIG: Record<string, { label: string; className: string; icon: typeof Clock }> = {
  Pending: {
    label: 'Pendente',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: Clock,
  },
  'In Progress': {
    label: 'Em Andamento',
    className: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: AlertCircle,
  },
  Resolved: {
    label: 'Resolvido',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: CheckCircle2,
  },
}

export default function Maintenance() {
  const { user, role } = useAuth()
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [description, setDescription] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    loadTickets()
  }, [])

  const loadTickets = async () => {
    setLoading(true)
    const { data } = await fetchTickets()
    if (data) setTickets(data)
    setLoading(false)
  }

  const handleCreate = async () => {
    if (!description.trim() || !user) return
    const { error } = await createTicket(description.trim(), user.id)
    if (error) {
      toast({
        title: 'Erro',
        description: 'Nao foi possivel criar o ticket.',
        variant: 'destructive',
      })
      return
    }
    toast({ title: 'Ticket criado!' })
    setDescription('')
    loadTickets()
  }

  const handleStatusChange = async (id: string, status: string) => {
    const { error } = await updateTicketStatus(id, status)
    if (error) {
      toast({ title: 'Erro', description: 'Nao foi possivel atualizar.', variant: 'destructive' })
      return
    }
    setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)))
    toast({ title: 'Status atualizado!' })
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-24" />
        <Skeleton className="h-64" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Manutencao</h1>
        <p className="text-muted-foreground mt-1">
          Reporte e acompanhe problemas de equipamentos e facilities.
        </p>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="border-b bg-muted/10 pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Wrench className="h-4 w-4" /> Novo Ticket
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="flex gap-3">
            <Input
              placeholder="Descreva o problema..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              className="flex-1"
            />
            <Button onClick={handleCreate} className="gap-2">
              <Plus className="h-4 w-4" /> Reportar
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {tickets.map((ticket) => {
          const sc = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.Pending
          const Icon = sc.icon
          return (
            <Card key={ticket.id} className="shadow-sm">
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className={cn('p-2 rounded-lg', sc.className)}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-foreground">{ticket.description}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {ticket.profiles?.full_name || 'Usuario'} ·{' '}
                      {new Date(ticket.created_at).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="outline" className={cn('font-medium', sc.className)}>
                    {sc.label}
                  </Badge>
                  {role === 'owner' && ticket.status !== 'Resolved' && (
                    <>
                      {ticket.status === 'Pending' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleStatusChange(ticket.id, 'In Progress')}
                        >
                          Em Andamento
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange(ticket.id, 'Resolved')}
                        className="gap-1.5"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" /> Resolver
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
        {tickets.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center text-muted-foreground">
              Nenhum ticket de manutencao aberto.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
