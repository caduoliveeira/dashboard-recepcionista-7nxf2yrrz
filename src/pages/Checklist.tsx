import { useState, useMemo } from 'react'
import useChecklistStore, { Period } from '@/stores/use-checklist-store'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { Clock, Info, MessageSquare, AlertCircle, CheckCircle2 } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'

const periodOrder: Period[] = [
  'Abertura',
  'Turno Manhã',
  'Troca de Turno',
  'Turno Tarde',
  'Fechamento',
]

export default function Checklist() {
  const { tasks, toggleTask, updateTaskNote } = useChecklistStore()
  const { toast } = useToast()
  const [selectedTask, setSelectedTask] = useState<string | null>(null)
  const [noteDraft, setNoteDraft] = useState('')

  const groupedTasks = useMemo(() => {
    const groups = {} as Record<string, typeof tasks>
    groups['Atenção Necessária'] = tasks.filter((t) => t.status === 'delayed')
    periodOrder.forEach((p) => {
      groups[p] = tasks.filter((t) => t.period === p && t.status !== 'delayed')
    })
    return groups
  }, [tasks])

  const handleToggle = (id: string, status: string) => {
    toggleTask(id)
    if (status !== 'completed')
      toast({
        title: 'Tarefa concluída',
        description: 'Ação registrada com sucesso.',
        duration: 2000,
      })
  }

  const handleSaveNote = (id: string) => {
    updateTaskNote(id, noteDraft)
    toast({ title: 'Nota salva', description: 'Anotação anexada à tarefa.' })
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Rotina Diária</h1>
        <p className="text-slate-500 mt-1 text-sm">Gerencie suas tarefas e evite esquecimentos.</p>
      </div>

      <div className="space-y-10">
        {Object.entries(groupedTasks).map(([groupName, groupTasks]) => {
          if (!groupTasks.length) return null
          const isUrgent = groupName === 'Atenção Necessária'
          const isCompleted = !isUrgent && groupTasks.every((t) => t.status === 'completed')

          return (
            <section key={groupName} className="animate-fade-in">
              <div className="flex items-center gap-3 mb-4">
                <h2
                  className={cn(
                    'text-lg font-bold flex items-center gap-2',
                    isUrgent ? 'text-rose-700' : 'text-slate-800',
                  )}
                >
                  {isUrgent && <AlertCircle className="h-5 w-5" />} {groupName}
                </h2>
                {isCompleted && (
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                    <CheckCircle2 className="h-3 w-3 mr-1" /> Concluído
                  </Badge>
                )}
                <div className="flex-1 h-px bg-slate-200 ml-4" />
              </div>

              <div className="space-y-3">
                {groupTasks.map((task) => (
                  <Card
                    key={task.id}
                    className={cn(
                      'border-l-4 overflow-hidden transition-all duration-300 hover:shadow-elevation',
                      task.status === 'completed'
                        ? 'border-l-emerald-500 opacity-70 bg-slate-50/50 shadow-none'
                        : task.status === 'delayed'
                          ? 'border-l-rose-500 bg-rose-50/30 animate-pulse-red'
                          : 'border-l-indigo-500 bg-white shadow-subtle',
                    )}
                  >
                    <div className="p-4 flex items-center gap-4 sm:gap-6">
                      <Checkbox
                        checked={task.status === 'completed'}
                        onCheckedChange={() => handleToggle(task.id, task.status)}
                        className={cn(
                          'h-6 w-6 rounded-md',
                          task.status === 'completed' &&
                            'data-[state=checked]:bg-emerald-500 border-emerald-500',
                        )}
                      />

                      <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                        <div className="flex-1">
                          <label
                            className={cn(
                              'text-base font-semibold block transition-colors cursor-pointer',
                              task.status === 'completed'
                                ? 'line-through text-slate-500'
                                : 'text-slate-900',
                            )}
                          >
                            {task.title}
                          </label>
                          <p className="text-sm text-slate-500 hidden sm:block truncate mt-0.5">
                            {task.sop}
                          </p>
                        </div>

                        <div className="flex items-center gap-4 flex-shrink-0">
                          <Badge
                            variant="outline"
                            className={cn(
                              'font-medium tabular-nums',
                              task.status === 'delayed'
                                ? 'border-rose-200 text-rose-700 bg-rose-50'
                                : task.status === 'completed'
                                  ? 'border-slate-200 text-slate-400'
                                  : 'border-slate-200 text-slate-700 bg-white',
                            )}
                          >
                            <Clock className="h-3 w-3 mr-1.5" /> {task.time}
                          </Badge>

                          <Sheet
                            onOpenChange={(o) => {
                              if (o) {
                                setSelectedTask(task.id)
                                setNoteDraft(task.note || '')
                              }
                            }}
                          >
                            <SheetTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className={cn(
                                  'rounded-full',
                                  task.note && 'text-indigo-600 bg-indigo-50',
                                )}
                              >
                                <MessageSquare className="h-4 w-4" />
                              </Button>
                            </SheetTrigger>
                            <SheetContent className="w-full sm:max-w-md">
                              <SheetHeader>
                                <SheetTitle className="text-xl pr-6">{task.title}</SheetTitle>
                                <SheetDescription>
                                  Detalhes e instruções operacionais da tarefa.
                                </SheetDescription>
                              </SheetHeader>
                              <div className="mt-8 space-y-6">
                                <div className="space-y-2">
                                  <h4 className="text-sm font-semibold flex items-center gap-2 text-slate-900">
                                    <Info className="h-4 w-4 text-indigo-500" /> Procedimento Padrão
                                    (SOP)
                                  </h4>
                                  <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-lg leading-relaxed border border-slate-100">
                                    {task.sop}
                                  </p>
                                </div>
                                <div className="space-y-3">
                                  <Label
                                    htmlFor="note"
                                    className="text-sm font-semibold text-slate-900"
                                  >
                                    Notas Rápidas
                                  </Label>
                                  <Textarea
                                    id="note"
                                    placeholder="Adicione um comentário ou justificativa..."
                                    className="resize-none h-32 focus-visible:ring-indigo-500"
                                    value={noteDraft}
                                    onChange={(e) => setNoteDraft(e.target.value)}
                                  />
                                  <Button
                                    className="w-full bg-indigo-600 hover:bg-indigo-700"
                                    onClick={() => handleSaveNote(task.id)}
                                  >
                                    Salvar Nota
                                  </Button>
                                </div>
                              </div>
                            </SheetContent>
                          </Sheet>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
