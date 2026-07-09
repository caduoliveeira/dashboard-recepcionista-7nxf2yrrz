import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { skipTask } from '@/services/task-exceptions'
import type { Task } from '@/services/tasks'

interface SkipTaskDialogProps {
  task: Task | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SkipTaskDialog({ task, open, onOpenChange }: SkipTaskDialogProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [reason, setReason] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!task || !user) return
    if (!reason.trim()) {
      toast({
        title: 'Motivo obrigatorio',
        description: 'Informe o motivo do skip.',
        variant: 'destructive',
      })
      return
    }
    setSaving(true)
    const { error } = await skipTask(task.id, reason.trim(), user.id)
    setSaving(false)
    if (error) {
      toast({ title: 'Erro', description: 'Nao foi possivel registrar.', variant: 'destructive' })
      return
    }
    toast({ title: 'Tarefa pulada', description: 'O proprietario foi notificado.' })
    setReason('')
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) setReason('')
        onOpenChange(o)
      }}
    >
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Pular Tarefa</DialogTitle>
          <DialogDescription>
            {task ? `"${task.title}" — informe o motivo (obrigatorio).` : 'Informe o motivo.'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <Label htmlFor="skip-reason">Motivo *</Label>
          <Textarea
            id="skip-reason"
            placeholder="Ex: Equipamento em manutencao, falta de insumo..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="resize-none h-24"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Salvando...' : 'Confirmar Skip'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
