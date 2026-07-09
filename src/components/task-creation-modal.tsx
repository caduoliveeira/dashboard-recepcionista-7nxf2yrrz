import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { createTask } from '@/services/tasks'
import { fetchCategories, type TaskCategory } from '@/services/task-categories'
import { uploadTaskAttachment } from '@/services/task-attachments'
import { FileText, Upload, X } from 'lucide-react'

const WEEK_DAYS = [
  { value: 'monday', label: 'Seg' },
  { value: 'tuesday', label: 'Ter' },
  { value: 'wednesday', label: 'Qua' },
  { value: 'thursday', label: 'Qui' },
  { value: 'friday', label: 'Sex' },
  { value: 'saturday', label: 'Sáb' },
  { value: 'sunday', label: 'Dom' },
]

interface TaskCreationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onTaskCreated: () => void
}

export function TaskCreationModal({ open, onOpenChange, onTaskCreated }: TaskCreationModalProps) {
  const { toast } = useToast()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [categories, setCategories] = useState<TaskCategory[]>([])
  const [mode, setMode] = useState<'specific' | 'recurring'>('specific')
  const [freq, setFreq] = useState<'daily' | 'weekly'>('daily')
  const [days, setDays] = useState<string[]>([])
  const [time, setTime] = useState('')
  const [priority, setPriority] = useState('Medium')
  const [saving, setSaving] = useState(false)
  const [instructionUrl, setInstructionUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [fileName, setFileName] = useState('')

  useEffect(() => {
    if (open) {
      fetchCategories().then(({ data }) => {
        if (data) setCategories(data)
      })
    }
  }, [open])

  const reset = () => {
    setTitle('')
    setDescription('')
    setCategoryId('')
    setMode('specific')
    setFreq('daily')
    setDays([])
    setTime('')
    setPriority('Medium')
    setInstructionUrl(null)
    setFileName('')
  }

  const toggleDay = (d: string) =>
    setDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]))

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'Arquivo muito grande',
        description: 'Máximo 10MB.',
        variant: 'destructive',
      })
      return
    }
    setUploading(true)
    const { url, error } = await uploadTaskAttachment(file)
    setUploading(false)
    if (error || !url) {
      toast({ title: 'Erro', description: 'Falha no upload.', variant: 'destructive' })
      return
    }
    setInstructionUrl(url)
    setFileName(file.name)
  }

  const removeFile = () => {
    setInstructionUrl(null)
    setFileName('')
  }

  const handleSave = async () => {
    if (!title.trim()) {
      toast({
        title: 'Campo obrigatório',
        description: 'O título é obrigatório.',
        variant: 'destructive',
      })
      return
    }
    if (!categoryId) {
      toast({
        title: 'Campo obrigatório',
        description: 'A categoria é obrigatória.',
        variant: 'destructive',
      })
      return
    }
    if (mode === 'recurring' && freq === 'weekly' && days.length === 0) {
      toast({
        title: 'Seleção necessária',
        description: 'Selecione pelo menos um dia.',
        variant: 'destructive',
      })
      return
    }

    const selectedCat = categories.find((c) => c.id === categoryId)
    setSaving(true)
    const { error } = await createTask({
      title: title.trim(),
      description: description.trim() || null,
      category: selectedCat?.name || 'General',
      category_id: categoryId,
      expected_time: time || null,
      is_recurring: mode === 'recurring',
      recurrence_type: mode === 'recurring' ? freq : null,
      recurrence_days: mode === 'recurring' && freq === 'weekly' ? days : null,
      priority,
      instruction_url: instructionUrl,
    })
    setSaving(false)

    if (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível criar a tarefa.',
        variant: 'destructive',
      })
      return
    }

    toast({ title: 'Sucesso', description: 'Tarefa criada com sucesso!' })
    reset()
    onOpenChange(false)
    onTaskCreated()
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) reset()
        onOpenChange(o)
      }}
    >
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Nova Tarefa</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto">
          <div className="space-y-2">
            <Label htmlFor="t-title">Título *</Label>
            <Input
              id="t-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Conferir agendamentos"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="t-desc">Descrição</Label>
            <Input
              id="t-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalhes (opcional)"
            />
          </div>
          <div className="space-y-2">
            <Label>Categoria (Turno) *</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o turno..." />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="t-time">Horário Previsto</Label>
            <Input id="t-time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Prioridade</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="High">Alta</SelectItem>
                <SelectItem value="Medium">Média</SelectItem>
                <SelectItem value="Low">Baixa</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Manual / Instrução (PDF ou Imagem)</Label>
            {instructionUrl ? (
              <div className="flex items-center gap-2 bg-muted/50 rounded-md p-2">
                <FileText className="h-4 w-4 text-primary shrink-0" />
                <span className="text-sm flex-1 truncate">{fileName}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={removeFile}
                  className="h-7 w-7 p-0"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            ) : (
              <label className="flex items-center gap-2 cursor-pointer border border-dashed rounded-md p-3 hover:bg-muted/30 transition-colors">
                <Upload className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {uploading ? 'Enviando...' : 'Clique para anexar arquivo'}
                </span>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
              </label>
            )}
          </div>
          <div className="space-y-3">
            <Label>Recorrência</Label>
            <RadioGroup
              value={mode}
              onValueChange={(v) => setMode(v as 'specific' | 'recurring')}
              className="flex gap-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="specific" id="r-specific" />
                <Label htmlFor="r-specific" className="font-normal cursor-pointer">
                  Específica
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="recurring" id="r-recurring" />
                <Label htmlFor="r-recurring" className="font-normal cursor-pointer">
                  Recorrente
                </Label>
              </div>
            </RadioGroup>
          </div>
          {mode === 'recurring' && (
            <div className="space-y-3 border-l-2 border-primary/20 pl-4 animate-fade-in">
              <div className="space-y-2">
                <Label>Frequência</Label>
                <Select value={freq} onValueChange={(v) => setFreq(v as 'daily' | 'weekly')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Diária</SelectItem>
                    <SelectItem value="weekly">Semanal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {freq === 'weekly' && (
                <div className="space-y-2 animate-fade-in">
                  <Label>Dias da Semana</Label>
                  <div className="flex flex-wrap gap-2">
                    {WEEK_DAYS.map((d) => (
                      <Button
                        key={d.value}
                        type="button"
                        variant={days.includes(d.value) ? 'default' : 'outline'}
                        size="sm"
                        className={cn('h-9 w-12', days.includes(d.value) && 'bg-primary')}
                        onClick={() => toggleDay(d.value)}
                      >
                        {d.label}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Salvando...' : 'Criar Tarefa'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
