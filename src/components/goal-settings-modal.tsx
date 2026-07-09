import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { updateGymSettings } from '@/services/settings'
import { useToast } from '@/hooks/use-toast'
import { Target } from 'lucide-react'

interface GoalSettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentTarget: number
  onSaved: (newTarget: number) => void
}

export function GoalSettingsModal({
  open,
  onOpenChange,
  currentTarget,
  onSaved,
}: GoalSettingsModalProps) {
  const [target, setTarget] = useState(currentTarget)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (open) setTarget(currentTarget)
  }, [currentTarget, open])

  const handleSave = async () => {
    setSaving(true)
    const { error } = await updateGymSettings(target)
    if (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar a configuração.',
        variant: 'destructive',
      })
    } else {
      toast({ title: 'Sucesso', description: 'Meta atualizada com sucesso!' })
      onSaved(target)
      onOpenChange(false)
    }
    setSaving(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Definir Meta de Conclusão
          </DialogTitle>
          <DialogDescription>
            Estabeleça a taxa alvo de conclusão pontual para a equipe.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Meta de Conclusão Pontual</Label>
              <span className="text-2xl font-bold text-primary tabular-nums">{target}%</span>
            </div>
            <Slider
              value={[target]}
              onValueChange={(v) => setTarget(v[0])}
              min={0}
              max={100}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
          <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
            A meta define o percentual mínimo de tarefas que devem ser concluídas dentro do horário
            previsto. O dashboard irá comparar o desempenho atual com esta meta.
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar Configurações'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
