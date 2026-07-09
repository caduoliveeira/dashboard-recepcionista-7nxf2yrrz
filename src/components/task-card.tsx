import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { Clock, Info, MessageSquare } from 'lucide-react'
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
import type { Task } from '@/stores/use-checklist-store'
import useChecklistStore from '@/stores/use-checklist-store'
import { getAvatarUrl } from '@/stores/use-auth-store'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function TaskCard({ task }: { task: Task }) {
  const { toggleTask, updateTaskNote } = useChecklistStore()
  const { toast } = useToast()
  const [noteDraft, setNoteDraft] = useState('')

  const handleToggle = () => {
    toggleTask(task.id)
    if (task.status !== 'completed') {
      toast({
        title: 'Tarefa concluída',
        description: 'Ação registrada com sucesso.',
        duration: 2000,
      })
    }
  }

  const handleSaveNote = () => {
    updateTaskNote(task.id, noteDraft)
    toast({ title: 'Nota salva', description: 'Anotação anexada à tarefa.' })
  }

  return (
    <Card
      className={cn(
        'border-l-4 overflow-hidden transition-all duration-300 hover:shadow-elevation',
        task.status === 'completed'
          ? 'border-l-emerald-500 opacity-70 bg-slate-50/50 shadow-none'
          : task.status === 'delayed'
            ? 'border-l-rose-500 bg-rose-50/30 animate-pulse-red'
            : 'border-l-primary bg-white shadow-subtle',
      )}
    >
      <div className="p-4 flex items-center gap-4 sm:gap-6">
        <Checkbox
          checked={task.status === 'completed'}
          onCheckedChange={handleToggle}
          className={cn(
            'h-6 w-6 rounded-md',
            task.status === 'completed' && 'data-[state=checked]:bg-emerald-500 border-emerald-500',
          )}
        />
        <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <div className="flex-1">
            <label
              className={cn(
                'text-base font-semibold block transition-colors cursor-pointer',
                task.status === 'completed' ? 'line-through text-slate-500' : 'text-slate-900',
              )}
            >
              {task.title}
            </label>
            <p className="text-sm text-slate-500 hidden sm:block truncate mt-0.5">{task.sop}</p>
            {task.status === 'completed' && task.completedBy && (
              <div className="flex items-center gap-2 mt-2">
                {task.completedByAvatarSeed && task.completedByGender && (
                  <img
                    src={getAvatarUrl({
                      avatarSeed: task.completedByAvatarSeed,
                      gender: task.completedByGender,
                    })}
                    alt={task.completedBy}
                    className="h-5 w-5 rounded-full object-cover"
                  />
                )}
                <span className="text-xs text-slate-500">
                  Concluído por{' '}
                  <span className="font-medium text-slate-700">{task.completedBy}</span>
                  {task.completedAt && ` às ${format(task.completedAt, 'HH:mm', { locale: ptBR })}`}
                </span>
              </div>
            )}
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
                if (o) setNoteDraft(task.note || '')
              }}
            >
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn('rounded-full', task.note && 'text-primary bg-primary/10')}
                >
                  <MessageSquare className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-md">
                <SheetHeader>
                  <SheetTitle className="text-xl pr-6">{task.title}</SheetTitle>
                  <SheetDescription>Detalhes e instruções operacionais da tarefa.</SheetDescription>
                </SheetHeader>
                <div className="mt-8 space-y-6">
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold flex items-center gap-2 text-slate-900">
                      <Info className="h-4 w-4 text-primary" /> Procedimento Padrão (SOP)
                    </h4>
                    <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-lg leading-relaxed border border-slate-100">
                      {task.sop}
                    </p>
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="note" className="text-sm font-semibold text-slate-900">
                      Notas Rápidas
                    </Label>
                    <Textarea
                      id="note"
                      placeholder="Adicione um comentário ou justificativa..."
                      className="resize-none h-32 focus-visible:ring-primary"
                      value={noteDraft}
                      onChange={(e) => setNoteDraft(e.target.value)}
                    />
                    <Button className="w-full" onClick={handleSaveNote}>
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
  )
}
