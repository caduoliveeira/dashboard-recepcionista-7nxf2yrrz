import { useState, useEffect, useMemo, useCallback } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import {
  fetchAuditGlobalMetrics,
  fetchAuditStaffStats,
  fetchAuditWeeklyTrend,
  type AuditGlobalMetrics,
  type AuditStaffStat,
  type WeeklyTrend,
} from '@/services/audit'
import { fetchGymSettings, type GymSettings } from '@/services/settings'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from 'recharts'
import { CheckCircle2, AlertTriangle, TrendingUp, Target, Download } from 'lucide-react'
import { exportToCSV } from '@/lib/csv-utils'
import { MaintenanceAlertPanel } from '@/components/maintenance-alert-panel'
import { DailyActivityLog } from '@/components/daily-activity-log'

const MONTHS = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
]

const chartConfig = {
  completed: { label: 'Concluídas', color: 'hsl(var(--primary))' },
  exceptions: { label: 'Exceções', color: 'hsl(var(--destructive))' },
}

export default function Audit() {
  const { role, loading } = useAuth()
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [metrics, setMetrics] = useState<AuditGlobalMetrics | null>(null)
  const [staffStats, setStaffStats] = useState<AuditStaffStat[]>([])
  const [weeklyTrend, setWeeklyTrend] = useState<WeeklyTrend[]>([])
  const [gymSettings, setGymSettings] = useState<GymSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const years = useMemo(() => {
    const arr: number[] = []
    for (let y = now.getFullYear(); y >= now.getFullYear() - 3; y--) arr.push(y)
    return arr
  }, [])

  const loadAudit = useCallback(async () => {
    setIsLoading(true)
    const [m, s, w, gs] = await Promise.all([
      fetchAuditGlobalMetrics(year, month),
      fetchAuditStaffStats(year, month),
      fetchAuditWeeklyTrend(year, month),
      fetchGymSettings(),
    ])
    setMetrics(m)
    setStaffStats(s)
    setWeeklyTrend(w)
    if (gs.data) setGymSettings(gs.data)
    setIsLoading(false)
  }, [year, month])

  useEffect(() => {
    if (role === 'owner') loadAudit()
  }, [role, loadAudit])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        Carregando...
      </div>
    )
  }
  if (role !== 'owner') return <Navigate to="/checklist" replace />

  const targetRate = gymSettings?.target_completion_rate ?? 90

  const handleExport = () => {
    const headers = [
      'Nome',
      'Tarefas Concluídas',
      'Exceções',
      'Tickets Manutenção',
      'Taxa de Conclusão (%)',
    ]
    const rows = staffStats.map((s) => [
      s.full_name || 'Sem nome',
      s.completed_count,
      s.exception_count,
      s.maintenance_count,
      s.completion_rate,
    ])
    exportToCSV(`auditoria-${MONTHS[month]}-${year}.csv`, headers, rows)
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Auditoria Mensal</h1>
          <p className="text-muted-foreground mt-1">
            Análise de performance e produtividade da equipe.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((m, i) => (
                <SelectItem key={m} value={String(i)}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExport} className="gap-2">
            <Download className="h-4 w-4" /> Exportar
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <DailyActivityLog />
        <MaintenanceAlertPanel />
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Tarefas Agendadas
                </CardTitle>
                <Target className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics?.totalTasks ?? 0}</div>
                <p className="text-xs text-muted-foreground mt-1">No período selecionado</p>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Concluídas
                </CardTitle>
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics?.completedCount ?? 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {metrics?.completionRate ?? 0}% de taxa geral
                </p>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Exceções
                </CardTitle>
                <AlertTriangle className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics?.exceptionCount ?? 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Tarefas puladas</p>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Meta da Academia
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{targetRate}%</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {(metrics?.completionRate ?? 0) >= targetRate ? (
                    <span className="text-emerald-600 font-medium">Meta atingida!</span>
                  ) : (
                    <span className="text-rose-600 font-medium">
                      {targetRate - (metrics?.completionRate ?? 0)}% abaixo da meta
                    </span>
                  )}
                </p>
              </CardContent>
            </Card>
          </div>

          {metrics && metrics.topReasons.length > 0 && (
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Principais Motivos de Exceção</CardTitle>
                <CardDescription>Os motivos mais citados para tarefas puladas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {metrics.topReasons.map((r, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Badge variant="secondary" className="w-8 justify-center">
                        {r.count}x
                      </Badge>
                      <span className="text-sm text-foreground">{r.reason}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Tendência Semanal</CardTitle>
              <CardDescription>Conclusões e exceções por semana do mês</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyTrend}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="week" tickLine={false} axisLine={false} fontSize={12} />
                    <YAxis tickLine={false} axisLine={false} fontSize={12} allowDecimals={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar
                      dataKey="completed"
                      fill={chartConfig.completed.color}
                      radius={[4, 4, 0, 0]}
                      name="Concluídas"
                    />
                    <Bar
                      dataKey="exceptions"
                      fill={chartConfig.exceptions.color}
                      radius={[4, 4, 0, 0]}
                      name="Exceções"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-border/60">
            <CardHeader className="border-b bg-muted/10 pb-4">
              <CardTitle>Performance da Equipe</CardTitle>
              <CardDescription>
                Estatísticas individuais — meta de conclusão: {targetRate}%
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="pl-6">Recepcionista</TableHead>
                    <TableHead className="text-center">Concluídas</TableHead>
                    <TableHead className="text-center">Exceções</TableHead>
                    <TableHead className="text-center">Manutenção</TableHead>
                    <TableHead className="text-center">Taxa</TableHead>
                    <TableHead className="text-right pr-6">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staffStats.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                        Nenhum recepcionista encontrado.
                      </TableCell>
                    </TableRow>
                  ) : (
                    staffStats.map((s) => {
                      const aboveTarget = s.completion_rate >= targetRate
                      return (
                        <TableRow key={s.id} className="hover:bg-muted/30">
                          <TableCell className="pl-6 font-medium text-foreground">
                            {s.full_name || 'Sem nome'}
                          </TableCell>
                          <TableCell className="text-center">{s.completed_count}</TableCell>
                          <TableCell className="text-center">{s.exception_count}</TableCell>
                          <TableCell className="text-center">{s.maintenance_count}</TableCell>
                          <TableCell className="text-center font-semibold">
                            {s.completion_rate}%
                          </TableCell>
                          <TableCell className="text-right pr-6">
                            <Badge
                              variant="outline"
                              className={
                                aboveTarget
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-rose-50 text-rose-700 border-rose-200'
                              }
                            >
                              {aboveTarget ? 'Acima da Meta' : 'Abaixo da Meta'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
