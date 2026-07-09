import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Button } from '@/components/ui/button'
import { Download, TrendingUp, AlertTriangle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

export default function Reports() {
  const { toast } = useToast()

  const efficiencyData = [
    { name: 'Abertura', estimated: 30, actual: 25 },
    { name: 'Manhã', estimated: 120, actual: 135 },
    { name: 'Troca', estimated: 45, actual: 40 },
    { name: 'Tarde', estimated: 180, actual: 190 },
    { name: 'Fecho', estimated: 60, actual: 75 },
  ]

  const errorHeatmapData = [
    { task: 'Relatórios de Turno', count: 15, label: 'Crítico' },
    { task: 'Agendamentos', count: 12, label: 'Alto' },
    { task: 'Correspondências', count: 8, label: 'Médio' },
    { task: 'Confirmações', count: 5, label: 'Baixo' },
    { task: 'Fundo de Caixa', count: 2, label: 'Baixo' },
  ]

  const handleExport = () => {
    toast({
      title: 'Gerando PDF',
      description: 'O relatório semanal está sendo preparado para download.',
    })
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Relatórios de Desempenho
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Análise de eficiência e mapa de calor de incidentes.
          </p>
        </div>
        <Button
          onClick={handleExport}
          className="bg-slate-900 hover:bg-slate-800 text-white gap-2 h-10 px-5"
        >
          <Download className="h-4 w-4" /> Exportar PDF
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white border-none shadow-subtle">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Eficiência Geral</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">87%</div>
            <p className="text-sm text-emerald-600 flex items-center gap-1 mt-1 font-medium">
              <TrendingUp className="h-4 w-4" /> +2.5% esta semana
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border-none shadow-subtle">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total de Atrasos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">14</div>
            <p className="text-sm text-rose-600 flex items-center gap-1 mt-1 font-medium">
              <TrendingUp className="h-4 w-4" /> +4 em relação à semana passada
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border-none shadow-subtle">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Tarefa Mais Crítica
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-slate-900 truncate">Relatórios de Turno</div>
            <p className="text-sm text-slate-500 mt-1 font-medium">15 esquecimentos no mês</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white border-none shadow-subtle flex flex-col">
          <CardHeader>
            <CardTitle>Tempo Estimado vs Realizado (Minutos)</CardTitle>
            <CardDescription>Comparativo de tempo gasto por período da rotina.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <ChartContainer
              config={{
                estimated: { label: 'Estimado', color: '#94A3B8' },
                actual: { label: 'Real', color: '#6366F1' },
              }}
              className="h-[300px] w-full"
            >
              <BarChart data={efficiencyData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  fontSize={12}
                  stroke="#64748B"
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  fontSize={12}
                  stroke="#64748B"
                />
                <ChartTooltip cursor={{ fill: '#F1F5F9' }} content={<ChartTooltipContent />} />
                <Bar
                  dataKey="estimated"
                  fill="var(--color-estimated)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
                <Bar
                  dataKey="actual"
                  fill="var(--color-actual)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="bg-white border-none shadow-subtle">
          <CardHeader>
            <CardTitle>Heatmap de Ocorrências</CardTitle>
            <CardDescription>Tarefas com maior índice de atraso ou esquecimento.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6 mt-4">
              {errorHeatmapData.map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-semibold text-slate-700">{item.task}</span>
                      <span className="text-sm font-bold text-slate-900">{item.count}</span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all',
                          item.label === 'Crítico'
                            ? 'bg-rose-500 w-[90%]'
                            : item.label === 'Alto'
                              ? 'bg-amber-500 w-[70%]'
                              : item.label === 'Médio'
                                ? 'bg-amber-300 w-[45%]'
                                : 'bg-emerald-400 w-[15%]',
                        )}
                      />
                    </div>
                  </div>
                  <div className="flex-shrink-0 w-8 flex justify-end">
                    {item.label === 'Crítico' && (
                      <AlertTriangle className="h-5 w-5 text-rose-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
