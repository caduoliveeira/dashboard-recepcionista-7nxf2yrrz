import { useState, useEffect, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Clock, Pencil, Plus, Trash2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  fetchTaskCountByCategory,
  type TaskCategory,
} from '@/services/task-categories'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCategoriesChanged: () => void
}

const fmt = (t: string | null) => (t ? t.substring(0, 5) : '--:--')

export function CategoryManagementModal({ open, onOpenChange, onCategoriesChanged }: Props) {
  const { toast } = useToast()
  const [categories, setCategories] = useState<TaskCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await fetchCategories()
    if (data) setCategories(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (open) load()
  }, [open, load])

  const resetForm = () => {
    setName('')
    setStartTime('')
    setEndTime('')
    setEditingId(null)
    setShowForm(false)
  }

  const startEdit = (cat: TaskCategory) => {
    setEditingId(cat.id)
    setName(cat.name)
    setStartTime(cat.start_time ? cat.start_time.substring(0, 5) : '')
    setEndTime(cat.end_time ? cat.end_time.substring(0, 5) : '')
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!name.trim()) {
      toast({ title: 'Erro', description: 'O nome é obrigatório.', variant: 'destructive' })
      return
    }
    setSaving(true)
    const input = { name: name.trim(), start_time: startTime || null, end_time: endTime || null }
    const { error } = editingId
      ? await updateCategory(editingId, input)
      : await createCategory(input)
    setSaving(false)
    if (error) {
      toast({ title: 'Erro', description: 'Não foi possível salvar.', variant: 'destructive' })
      return
    }
    toast({
      title: 'Sucesso',
      description: editingId ? 'Categoria atualizada!' : 'Categoria criada!',
    })
    resetForm()
    load()
    onCategoriesChanged()
  }

  const handleDelete = async (cat: TaskCategory) => {
    const { count } = await fetchTaskCountByCategory(cat.id)
    if (count > 0) {
      toast({
        title: 'Não é possível excluir',
        description: `${count} tarefa(s) vinculada(s). Revincule antes de excluir.`,
        variant: 'destructive',
      })
      return
    }
    const { error } = await deleteCategory(cat.id)
    if (error) {
      toast({ title: 'Erro', description: 'Não foi possível excluir.', variant: 'destructive' })
      return
    }
    toast({ title: 'Sucesso', description: 'Categoria excluída!' })
    load()
    onCategoriesChanged()
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) resetForm()
        onOpenChange(o)
      }}
    >
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Gerenciar Categorias</DialogTitle>
          <DialogDescription>
            Crie, edite e exclua categorias de tarefas com horários de turno.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          {showForm ? (
            <div className="space-y-3 border rounded-lg p-4 bg-muted/30">
              <span className="text-sm font-medium">
                {editingId ? 'Editar Categoria' : 'Nova Categoria'}
              </span>
              <div className="space-y-2">
                <Label htmlFor="cat-name">Nome</Label>
                <Input
                  id="cat-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Manhã"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="cat-start">Início</Label>
                  <Input
                    id="cat-start"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cat-end">Fim</Label>
                  <Input
                    id="cat-end"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSave} disabled={saving}>
                  {saving ? 'Salvando...' : 'Salvar'}
                </Button>
                <Button size="sm" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <Button size="sm" className="gap-2" onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4" /> Adicionar Categoria
            </Button>
          )}
          {loading ? (
            <p className="text-sm text-muted-foreground text-center py-4">Carregando...</p>
          ) : (
            <div className="space-y-2">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between border rounded-lg p-3"
                >
                  <div>
                    <p className="font-medium">{cat.name}</p>
                    {(cat.start_time || cat.end_time) && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Clock className="h-3 w-3" />
                        {fmt(cat.start_time)} às {fmt(cat.end_time)}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => startEdit(cat)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => handleDelete(cat)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
              {categories.length === 0 && !showForm && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhuma categoria cadastrada.
                </p>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
