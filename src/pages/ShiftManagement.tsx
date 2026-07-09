import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Navigate } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Pencil, Trash2, AlertTriangle, Clock } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  type TaskCategory,
} from '@/services/task-categories'
import { supabase } from '@/lib/supabase/client'

export default function ShiftManagement() {
  const { role, loading } = useAuth()
  const [categories, setCategories] = useState<TaskCategory[]>([])
  const [taskCounts, setTaskCounts] = useState<Record<string, number>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCat, setEditingCat] = useState<TaskCategory | null>(null)
  const [deleteCat, setDeleteCat] = useState<TaskCategory | null>(null)
  const [name, setName] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (role === 'owner') loadData()
  }, [role])

  if (loading)
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        Carregando...
      </div>
    )
  if (role !== 'owner') return <Navigate to="/checklist" replace />

  async function loadData() {
    setIsLoading(true)
    const { data: cats } = await fetchCategories()
    if (cats) setCategories(cats)
    const { data: tasks } = await supabase.from('tasks').select('category_id')
    const counts: Record<string, number> = {}
    ;(tasks || []).forEach((t: any) => {
      if (t.category_id) counts[t.category_id] = (counts[t.category_id] || 0) + 1
    })
    setTaskCounts(counts)
    setIsLoading(false)
  }

  const openAdd = () => {
    setEditingCat(null)
    setName('')
    setStartTime('')
    setEndTime('')
    setDialogOpen(true)
  }

  const openEdit = (cat: TaskCategory) => {
    setEditingCat(cat)
    setName(cat.name)
    setStartTime(cat.start_time?.substring(0, 5) || '')
    setEndTime(cat.end_time?.substring(0, 5) || '')
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!name.trim()) {
      toast({ title: 'Nome obrigatório', variant: 'destructive' })
      return
    }
    setSaving(true)
    const payload = {
      name: name.trim(),
      start_time: startTime ? `${startTime}:00` : null,
      end_time: endTime ? `${endTime}:00` : null,
    }
    const { error } = editingCat
      ? await updateCategory(editingCat.id, payload)
      : await createCategory(payload)
    setSaving(false)
    if (error) {
      toast({ title: 'Erro', description: 'Não foi possível salvar.', variant: 'destructive' })
      return
    }
    toast({ title: 'Sucesso', description: editingCat ? 'Turno atualizado!' : 'Turno criado!' })
    setDialogOpen(false)
    loadData()
  }

  const handleDelete = async () => {
    if (!deleteCat) return
    const { error } = await deleteCategory(deleteCat.id)
    if (error) {
      toast({ title: 'Erro', description: 'Não foi possível excluir.', variant: 'destructive' })
      return
    }
    toast({ title: 'Excluído', description: 'Turno removido.' })
    setDeleteCat(null)
    loadData()
  }

  const fmt = (t: string | null) => (t ? t.substring(0, 5) : '--:--')

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Gestão de Turnos</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie as categorias (turnos) do checklist diário.
          </p>
        </div>
        <Button onClick={openAdd} className="gap-2">
          <Plus className="h-4 w-4" /> Novo Turno
        </Button>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Carregando...
          </CardContent>
        </Card>
      ) : categories.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center text-muted-foreground">
            Nenhum turno cadastrado. Clique em "Novo Turno" para começar.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <Card key={cat.id} className="shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{cat.name}</CardTitle>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <Clock className="h-3.5 w-3.5" />
                      {fmt(cat.start_time)} — {fmt(cat.end_time)}
                    </p>
                  </div>
                  <Badge variant="secondary">{taskCounts[cat.id] || 0} tarefas</Badge>
                </div>
              </CardHeader>
              <CardContent className="flex gap-2 pt-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => openEdit(cat)}
                >
                  <Pencil className="h-3.5 w-3.5" /> Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-destructive hover:text-destructive"
                  onClick={() => setDeleteCat(cat)}
                >
                  <Trash2 className="h-3.5 w-3.5" /> Excluir
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>{editingCat ? 'Editar Turno' : 'Novo Turno'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="cat-name">Nome do Turno *</Label>
              <Input
                id="cat-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Madrugada"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteCat} onOpenChange={(o) => !o && setDeleteCat(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Confirmar Exclusão
            </DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o turno{' '}
              <strong className="text-foreground">{deleteCat?.name}</strong>?
              {(deleteCat && taskCounts[deleteCat.id]) > 0 && (
                <span className="block mt-2 text-destructive font-medium">
                  Atenção: existem {taskCounts[deleteCat.id]} tarefas vinculadas a este turno. Elas
                  ficarão sem categoria.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteCat(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
